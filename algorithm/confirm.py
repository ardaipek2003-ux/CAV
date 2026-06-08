"""
Confirm endpoint — commits an order by reserving spots, creating plants, and queuing robot jobs.
"""

import os
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter()

LETTUCE_BASELINE_DAYS = int(os.getenv("LETTUCE_BASELINE_DAYS", "30"))
TOMATO_BASELINE_DAYS = int(os.getenv("TOMATO_BASELINE_DAYS", "60"))


class ConfirmRequest(BaseModel):
    order_id: str
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
        spots_needed = order["spots_needed"]
        baseline_days = get_baseline_days(crop_type)
        now = datetime.utcnow()

        # Begin transaction
        async with conn.transaction():
            # 1. Fetch and lock spots_needed EMPTY spots
            spots = await conn.fetch("""
                SELECT id, growth_multiplier 
                FROM spots 
                WHERE status = 'EMPTY' 
                ORDER BY module_number, row_number, spot_number 
                LIMIT $1 
                FOR UPDATE SKIP LOCKED
            """, spots_needed)

            if len(spots) < spots_needed:
                raise HTTPException(status_code=409, detail="Not enough empty spots available. Please request a new quote.")

            max_harvest = now
            
            plant_records = []
            robot_records = []
            spot_ids = []
            spot_updates = []

            for spot in spots:
                spot_id = spot["id"]
                spot_ids.append(spot_id)
                actual_days = baseline_days / spot["growth_multiplier"]
                expected_harvest = now + timedelta(days=actual_days)
                if expected_harvest > max_harvest:
                    max_harvest = expected_harvest

                plant_id = str(uuid.uuid4())
                job_id = str(uuid.uuid4())
                
                plant_records.append((plant_id, body.order_id, crop_type, spot_id, now, expected_harvest, 'PLANTED'))
                robot_records.append((job_id, 'PLANT', plant_id, spot_id, 1, 'QUEUED', now))
                spot_updates.append((plant_id, spot_id))

            # Bulk Insert Plants
            await conn.executemany("""
                INSERT INTO plants (id, order_id, crop_type, spot_id, planted_at, expected_harvest, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, plant_records)

            # Bulk Update Spots
            await conn.executemany("""
                UPDATE spots SET status = 'OCCUPIED', plant_id = $1 WHERE id = $2
            """, spot_updates)

            # Bulk Insert Robot Jobs
            await conn.executemany("""
                INSERT INTO robot_jobs (id, job_type, plant_id, to_spot_id, priority, status, queued_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, robot_records)

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
        "plantsCreated": len(spot_ids),
    }
