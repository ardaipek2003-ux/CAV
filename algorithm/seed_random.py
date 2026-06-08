import asyncio
import asyncpg
import random
import uuid
from datetime import datetime, timedelta, timezone

DATABASE_URL = "postgresql://vfarm:vfarm_secret@localhost:5432/vertical_farm"

async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    buyer_id = await conn.fetchval("SELECT id FROM users WHERE email = 'buyer@example.com'")
    if not buyer_id:
        print("Buyer not found. Make sure to run npm run seed first.")
        return

    # Target: 225,000 spots
    target_spots = 225000
    
    print(f"Fetching {target_spots} empty spots...")
    spots = await conn.fetch("SELECT id FROM spots WHERE status = 'EMPTY' LIMIT $1", target_spots)
    
    if not spots:
        print("No empty spots found.")
        return
        
    print(f"Found {len(spots)} empty spots. Generating random orders...")
    
    spot_idx = 0
    total_spots = len(spots)
    
    orders_data = []
    plants_data = []
    spots_update_data = []
    
    now = datetime.now()
    
    while spot_idx < total_spots:
        # random order size between 500 and 5000 spots
        order_size = random.randint(500, 5000)
        
        if spot_idx + order_size > total_spots:
            order_size = total_spots - spot_idx
            
        order_id = str(uuid.uuid4())
        crop_type = random.choice(['LETTUCE', 'TOMATO'])
        kg_per_spot = 0.3 if crop_type == 'LETTUCE' else 0.5
        quantity = order_size * kg_per_spot
        
        # projected harvest somewhere in next 10-60 days
        harvest_date = now + timedelta(days=random.randint(10, 60))
        
        orders_data.append((
            order_id, buyer_id, crop_type, float(quantity), order_size, 'GROWING', harvest_date, harvest_date, now
        ))
        
        for i in range(order_size):
            spot_id = str(spots[spot_idx + i]['id'])
            plant_id = str(uuid.uuid4())
            plants_data.append((
                plant_id, order_id, crop_type, spot_id, now, harvest_date, 'PLANTED'
            ))
            spots_update_data.append((
                plant_id, 'OCCUPIED', spot_id
            ))
            
        spot_idx += order_size
        
    print(f"Prepared {len(orders_data)} orders and {len(plants_data)} plants. Inserting...")
    
    async with conn.transaction():
        # Insert orders
        await conn.executemany("""
            INSERT INTO orders (id, buyer_id, crop_type, quantity_kg, spots_needed, status, quoted_harvest, actual_harvest, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """, orders_data)
        
        # Insert plants
        await conn.executemany("""
            INSERT INTO plants (id, order_id, crop_type, spot_id, planted_at, expected_harvest, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, plants_data)
        
        # Update spots
        await conn.executemany("""
            UPDATE spots SET plant_id = $1, status = $2 WHERE id = $3
        """, spots_update_data)
        
    print("Done! Database successfully populated with random orders.")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
