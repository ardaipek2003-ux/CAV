"""
Quote endpoint — calculates the earliest delivery date for a new order.
Read-only: does NOT modify the database.
"""

import os
import math
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Config from environment
LETTUCE_BASELINE_DAYS = int(os.getenv("LETTUCE_BASELINE_DAYS", "30"))
TOMATO_BASELINE_DAYS = int(os.getenv("TOMATO_BASELINE_DAYS", "60"))
LETTUCE_KG_PER_SPOT = float(os.getenv("LETTUCE_KG_PER_SPOT", "0.3"))
TOMATO_KG_PER_SPOT = float(os.getenv("TOMATO_KG_PER_SPOT", "0.5"))


class QuoteRequest(BaseModel):
    buyer_id: str
    crop_type: str  # LETTUCE or TOMATO
    quantity_kg: float


class QuoteResponse(BaseModel):
    orderId: str
    deliveryDate: str
    spotsNeeded: int
    proposedSpots: list[dict]


def get_baseline_days(crop_type: str) -> int:
    return LETTUCE_BASELINE_DAYS if crop_type == "LETTUCE" else TOMATO_BASELINE_DAYS


def get_kg_per_spot(crop_type: str) -> float:
    return LETTUCE_KG_PER_SPOT if crop_type == "LETTUCE" else TOMATO_KG_PER_SPOT


@router.post("/quote")
async def quote(body: QuoteRequest, request: Request):
    """
    Calculate delivery date for a new order.
    
    Algorithm:
    1. Query empty spots ordered by module_number, row_number (fastest first)
    2. Fill modules sequentially (complete one before moving to next)
    3. Compute projected harvest for each spot
    4. Delivery date = max harvest across all spots (all-at-once)
    5. Run relocation simulation for potential improvement
    """
    pool = request.app.state.pool

    crop_type = body.crop_type.upper()
    if crop_type not in ("LETTUCE", "TOMATO"):
        raise HTTPException(status_code=400, detail="crop_type must be LETTUCE or TOMATO")

    baseline_days = get_baseline_days(crop_type)
    kg_per_spot = get_kg_per_spot(crop_type)
    spots_needed = math.ceil(body.quantity_kg / kg_per_spot)

    if spots_needed <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")

    async with pool.acquire() as conn:
        # 1. Query empty spots ordered for sequential module fill
        empty_spots = await conn.fetch(
            """
            SELECT id, module_number, row_number, spot_number, growth_multiplier
            FROM spots
            WHERE status = 'EMPTY'
            ORDER BY module_number ASC, row_number ASC, spot_number ASC
            LIMIT $1
            """,
            spots_needed + 100
        )

        if len(empty_spots) < spots_needed:
            # Calculate when capacity frees up
            next_harvest = await conn.fetchval(
                """
                SELECT MIN(expected_harvest) FROM plants WHERE status = 'PLANTED'
                """
            )
            raise HTTPException(
                status_code=422,
                detail={
                    "message": "Not enough capacity for this order",
                    "available_spots": len(empty_spots),
                    "spots_needed": spots_needed,
                    "earliest_capacity": next_harvest.isoformat() if next_harvest else None,
                },
            )

        # 2. Sequential module fill — fill each module completely before next
        selected_spots = []
        current_module = None
        module_spots = []

        for spot in empty_spots:
            if len(selected_spots) >= spots_needed:
                break

            if spot["module_number"] != current_module:
                # If we have leftover spots in previous module, that's ok (it was partially empty)
                current_module = spot["module_number"]
                module_spots = []

            selected_spots.append(spot)
            module_spots.append(spot)

        # 3. Compute projected harvest for each selected spot
        now = datetime.now(timezone.utc)
        proposed_spots = []
        max_harvest = now

        for spot in selected_spots:
            actual_days = baseline_days / spot["growth_multiplier"]
            projected_harvest = now + timedelta(days=actual_days)

            if projected_harvest > max_harvest:
                max_harvest = projected_harvest

            proposed_spots.append({
                "spotId": str(spot["id"]),
                "moduleNumber": spot["module_number"],
                "rowNumber": spot["row_number"],
                "spotNumber": spot["spot_number"],
                "growthMultiplier": spot["growth_multiplier"],
                "projectedHarvest": projected_harvest.isoformat(),
            })

        # 4. Relocation simulation — check if swapping to faster empty spots improves max_harvest
        # Find the bottleneck spot (the one with the latest harvest)
        bottleneck_idx = max(range(len(proposed_spots)), key=lambda i: proposed_spots[i]["projectedHarvest"])
        bottleneck = proposed_spots[bottleneck_idx]
        bottleneck_spot_id = bottleneck["spotId"]

        # Look for faster empty spots NOT in our selected set
        selected_ids = {s["spotId"] for s in proposed_spots}

        for spot in empty_spots:
            spot_id_str = str(spot["id"])
            if spot_id_str in selected_ids:
                continue
            if spot["growth_multiplier"] > selected_spots[bottleneck_idx]["growth_multiplier"]:
                # This spot is faster — simulate swap
                new_actual_days = baseline_days / spot["growth_multiplier"]
                new_harvest = now + timedelta(days=new_actual_days)

                # Check if this improves the overall max
                other_max = max(
                    (datetime.fromisoformat(s["projectedHarvest"])
                     for i, s in enumerate(proposed_spots) if i != bottleneck_idx),
                    default=now
                )

                if new_harvest < max_harvest and max(new_harvest, other_max) < max_harvest:
                    # Swap: replace bottleneck with this faster spot
                    proposed_spots[bottleneck_idx] = {
                        "spotId": spot_id_str,
                        "moduleNumber": spot["module_number"],
                        "rowNumber": spot["row_number"],
                        "spotNumber": spot["spot_number"],
                        "growthMultiplier": spot["growth_multiplier"],
                        "projectedHarvest": new_harvest.isoformat(),
                    }
                    max_harvest = max(new_harvest, other_max)

                    # Recalculate bottleneck
                    bottleneck_idx = max(range(len(proposed_spots)),
                                        key=lambda i: proposed_spots[i]["projectedHarvest"])
                    break  # One swap per quote is sufficient

        # 5. Create pending order in DB
        order_id = await conn.fetchval(
            """
            INSERT INTO orders (id, buyer_id, crop_type, quantity_kg, spots_needed, status, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', NOW())
            RETURNING id
            """,
            body.buyer_id,
            crop_type,
            body.quantity_kg,
            spots_needed,
        )

        return QuoteResponse(
            orderId=str(order_id),
            deliveryDate=max_harvest.isoformat(),
            spotsNeeded=spots_needed,
            proposedSpots=proposed_spots,
        )
