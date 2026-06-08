import asyncio
import asyncpg
import os

DATABASE_URL = "postgresql://neondb_owner:npg_Yfs8K6RBNMwG@ep-summer-art-a2f1eu2i.eu-central-1.aws.neon.tech/neondb?sslmode=require"

async def test():
    conn = await asyncpg.connect(DATABASE_URL)
    users = await conn.fetch("SELECT id, email FROM users LIMIT 1")
    print("User:", dict(users[0]) if users else None)
    
    if users:
        buyer_id = users[0]['id']
        print(f"Testing quote logic with buyer_id {buyer_id}")
        # Call the vercel api
        import requests
        res = requests.post("https://algorithm-taupe-two.vercel.app/quote", json={
            "buyer_id": buyer_id,
            "crop_type": "TOMATO",
            "quantity_kg": 2
        })
        print(res.status_code)
        print(res.text)

    await conn.close()

asyncio.run(test())
