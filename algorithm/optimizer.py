"""
Relocation optimizer — moves bottleneck plants to faster spots to improve delivery dates.

Runs:
1. On every new order confirmation (async)
2. On a 5-day cron schedule via BullMQ

Algorithm:
1. Load all active orders with their plants and current spots
2. For each order, identify the bottleneck plant (latest expected_harvest)
3. For each bottleneck, find empty spots with higher growth_multiplier
4. If a better spot exists and improves delivery, mark as relocation candidate
5. Sort candidates by gain (days saved), process greedily
6. Create RobotJob records for each relocation
7. Respect robot arm throughput cap
"""

import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

ROBOT_JOBS_PER_DAY = int(os.getenv("ROBOT_JOBS_PER_DAY", "500"))
LETTUCE_BASELINE_DAYS = int(os.getenv("LETTUCE_BASELINE_DAYS", "30"))
TOMATO_BASELINE_DAYS = int(os.getenv("TOMATO_BASELINE_DAYS", "60"))


class OptimizeRequest(BaseModel):
    order_id: Optional[str] = None


def get_baseline_days(crop_type: str) -> int:
    return LETTUCE_BASELINE_DAYS if crop_type == "LETTUCE" else TOMATO_BASELINE_DAYS


async def run_optimizer(pool, order_id: str | None = None):
    """
    Core optimizer logic. Can be called directly or via the API endpoint.
    """
    async with pool.acquire() as conn:
        # 1. Check robot arm capacity — how many jobs are already queued?
        queued_jobs = await conn.fetchval(
            "SELECT COUNT(*) FROM robot_jobs WHERE status = 'QUEUED'"
        )
        max_new_relocations = (ROBOT_JOBS_PER_DAY * 5) - queued_jobs
        if max_new_relocations <= 0:
            return {"message": "Robot arm at capacity, no relocations queued", "relocations": 0}

        # 2. Load active orders with bottleneck plants
        query = """
            SELECT o.id as order_id, o.crop_type,
                   p.id as plant_id, p.expected_harvest, p.status as plant_status,
                   s.id as spot_id, s.growth_multiplier, s.module_number, s.row_number
            FROM orders o
            JOIN plants p ON p.order_id = o.id
            JOIN spots s ON s.id = p.spot_id
            WHERE o.status IN ('CONFIRMED', 'GROWING')
              AND p.status = 'PLANTED'
        """
        if order_id:
            query += f" AND o.id = '{order_id}'"
        query += " ORDER BY o.id, p.expected_harvest DESC"

        rows = await conn.fetch(query)

        if not rows:
            return {"message": "No active plants to optimize", "relocations": 0}

        # 3. Group by order, find bottleneck per order
        orders_map: dict[str, list] = {}
        for row in rows:
            oid = str(row["order_id"])
            if oid not in orders_map:
                orders_map[oid] = []
            orders_map[oid].append(row)

        # 4. Find empty faster spots
        empty_spots = await conn.fetch(
            """
            SELECT id, growth_multiplier, module_number, row_number
            FROM spots
            WHERE status = 'EMPTY'
            ORDER BY growth_multiplier DESC
            """
        )

        if not empty_spots:
            return {"message": "No empty spots available for relocation", "relocations": 0}

        # 5. Build relocation candidates
        candidates = []
        used_empty_spots = set()
        now = datetime.utcnow()

        for oid, plants in orders_map.items():
            # Bottleneck = first plant (sorted DESC by expected_harvest)
            bottleneck = plants[0]
            crop_type = bottleneck["crop_type"]
            baseline_days = get_baseline_days(crop_type)

            for empty_spot in empty_spots:
                empty_id = str(empty_spot["id"])
                if empty_id in used_empty_spots:
                    continue

                # Only consider if the empty spot has a higher multiplier
                if empty_spot["growth_multiplier"] <= bottleneck["growth_multiplier"]:
                    continue

                # Calculate new expected harvest at the faster spot
                # Time already grown at current spot
                planted_at = bottleneck["expected_harvest"] - timedelta(
                    days=baseline_days / bottleneck["growth_multiplier"]
                )
                days_already_grown = (now - planted_at).total_seconds() / 86400
                if days_already_grown < 0:
                    days_already_grown = 0

                total_days_at_new = baseline_days / empty_spot["growth_multiplier"]
                remaining_days = max(0, total_days_at_new - days_already_grown)
                new_harvest = now + timedelta(days=remaining_days)

                # Only if it actually improves the harvest
                gain_days = (bottleneck["expected_harvest"] - new_harvest).total_seconds() / 86400

                if gain_days > 0.5:  # At least half a day improvement
                    candidates.append({
                        "order_id": oid,
                        "plant_id": str(bottleneck["plant_id"]),
                        "from_spot_id": str(bottleneck["spot_id"]),
                        "to_spot_id": empty_id,
                        "gain_days": gain_days,
                        "new_harvest": new_harvest,
                        "crop_type": crop_type,
                    })
                    used_empty_spots.add(empty_id)
                    break  # One relocation per order bottleneck

        # 6. Sort by gain descending, process greedily
        candidates.sort(key=lambda c: c["gain_days"], reverse=True)

        relocations_done = 0

        async with conn.transaction():
            for candidate in candidates:
                if relocations_done >= max_new_relocations:
                    break

                # Update old spot: mark as EMPTY, clear plant_id
                await conn.execute(
                    "UPDATE spots SET status = 'EMPTY', plant_id = NULL WHERE id = $1",
                    candidate["from_spot_id"],
                )

                # Update new spot: mark as OCCUPIED, set plant_id
                await conn.execute(
                    "UPDATE spots SET status = 'OCCUPIED', plant_id = $1 WHERE id = $2",
                    candidate["plant_id"],
                    candidate["to_spot_id"],
                )

                # Update plant: new spot_id, new expected_harvest, relocated_from
                await conn.execute(
                    """
                    UPDATE plants 
                    SET spot_id = $1, 
                        expected_harvest = $2, 
                        relocated_from = $3
                    WHERE id = $4
                    """,
                    candidate["to_spot_id"],
                    candidate["new_harvest"],
                    candidate["from_spot_id"],
                    candidate["plant_id"],
                )

                # Update order's actual_harvest if improved
                # Recalculate the order's max harvest
                new_order_harvest = await conn.fetchval(
                    """
                    SELECT MAX(expected_harvest) FROM plants 
                    WHERE order_id = $1 AND status = 'PLANTED'
                    """,
                    candidate["order_id"],
                )
                if new_order_harvest:
                    await conn.execute(
                        "UPDATE orders SET actual_harvest = $1 WHERE id = $2",
                        new_order_harvest,
                        candidate["order_id"],
                    )

                # Create robot job for relocation
                await conn.execute(
                    """
                    INSERT INTO robot_jobs (id, job_type, plant_id, from_spot_id, to_spot_id, priority, status, queued_at)
                    VALUES (gen_random_uuid(), 'RELOCATE', $1, $2, $3, 2, 'QUEUED', $4)
                    """,
                    candidate["plant_id"],
                    candidate["from_spot_id"],
                    candidate["to_spot_id"],
                    now,
                )

                relocations_done += 1
                print(f"  Relocated plant {candidate['plant_id'][:8]}... "
                      f"gain={candidate['gain_days']:.1f} days")

        return {
            "message": f"Optimizer completed. {relocations_done} relocation(s) queued.",
            "relocations": relocations_done,
            "candidates_found": len(candidates),
        }


@router.post("/optimize")
async def optimize(request: Request, body: OptimizeRequest = OptimizeRequest()):
    """
    Run the relocation optimizer.
    Called by BullMQ cron job and after order confirmation.
    """
    pool = request.app.state.pool
    result = await run_optimizer(pool, order_id=body.order_id)
    return result
