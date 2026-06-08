"""
Confirm endpoint — commits an order by reserving spots, creating plants, and queuing robot jobs.
"""

import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter()

LETTUCE_BASELINE_DAYS = int(os.getenv("LETTUCE_BASELINE_DAYS", "30"))
TOMATO_BASELINE_DAYS = int(os.getenv("TOMATO_BASELINE_DAYS", "60"))


class ConfirmRequest(BaseModel):
    order_id: str
    proposed_spots: list[dict]
    buyer_id: str


def get_baseline_days(crop_type: str) -> int:
    return LETTUCE_BASELINE_DAYS if crop_type == "LETTUCE" else TOMATO_BASELINE_DAYS


@router.post("/confirm")
async def confirm(body: ConfirmRequest, request: Request):
    """
    Confirm and commit an order.
    
    Transactional:
    1. Mark spots as RESERVED
    2. Create Plant records
    3. Create RobotJob records
    4. Update Order status to CONFIRMED
    5. Trigger async optimizer
    """
    pool = request.app.state.pool

    async with pool.acquire() as conn:
        # Verify order exists and belongs to buyer
        order = await conn.fetchrow(
            "SELECT id, crop_type, spots_needed, status FROM orders WHERE id = $1",
            body.order_id,
        )

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        if order["status"] != "PENDING":
            raise HTTPException(status_code=409, detail="Order already confirmed")

        crop_type = order["crop_type"]
        baseline_days = get_baseline_days(crop_type)
        now = datetime.utcnow()

        # Begin transaction
        async with conn.transaction():
            max_harvest = now
            plant_ids = []

            for spot_data in body.proposed_spots:
                spot_id = spot_data["spotId"]
                growth_multiplier = spot_data.get("growthMultiplier", 1.0)

                # Verify spot is still empty
                spot = await conn.fetchrow(
                    "SELECT id, status, growth_multiplier FROM spots WHERE id = $1 FOR UPDATE",
                    spot_id,
                )

                if not spot or spot["status"] != "EMPTY":
                    raise HTTPException(
                        status_code=409,
                        detail=f"Spot {spot_id} is no longer available. Please request a new quote.",
                    )

                # Compute expected harvest
                actual_days = baseline_days / spot["growth_multiplier"]
                expected_harvest = now + timedelta(days=actual_days)
                if expected_harvest > max_harvest:
                    max_harvest = expected_harvest

                # Create plant
                plant_id = await conn.fetchval(
                    """
                    INSERT INTO plants (id, order_id, crop_type, spot_id, planted_at, expected_harvest, status)
                    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'PLANTED')
                    RETURNING id
                    """,
                    body.order_id,
                    crop_type,
                    spot_id,
                    now,
                    expected_harvest,
                )
                plant_ids.append(str(plant_id))

                # Mark spot as occupied and link plant
                await conn.execute(
                    "UPDATE spots SET status = 'OCCUPIED', plant_id = $1 WHERE id = $2",
                    plant_id,
                    spot_id,
                )

                # Create robot job for planting
                await conn.execute(
                    """
                    INSERT INTO robot_jobs (id, job_type, plant_id, to_spot_id, priority, status, queued_at)
                    VALUES (gen_random_uuid(), 'PLANT', $1, $2, 1, 'QUEUED', $3)
                    """,
                    plant_id,
                    spot_id,
                    now,
                )

            # Update order
            await conn.execute(
                """
                UPDATE orders 
                SET status = 'CONFIRMED', 
                    quoted_harvest = $1, 
                    actual_harvest = $1,
                    confirmed_at = $2
                WHERE id = $3
                """,
                max_harvest,
                now,
                body.order_id,
            )

    # Trigger optimizer async (fire and forget via the /optimize endpoint)
    import asyncio

    async def trigger_optimizer():
        try:
            from optimizer import run_optimizer
            await run_optimizer(pool, order_id=body.order_id)
        except Exception as e:
            print(f"Optimizer error (non-blocking): {e}")

    asyncio.create_task(trigger_optimizer())

    return {
        "status": "confirmed",
        "orderId": body.order_id,
        "harvestDate": max_harvest.isoformat(),
        "plantsCreated": len(plant_ids),
    }
