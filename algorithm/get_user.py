import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect("postgresql://neondb_owner:npg_cH40vEpFICGa@ep-summer-art-a2f1eu2i.eu-central-1.aws.neon.tech/neondb?sslmode=require")
    user_id = await conn.fetchval("SELECT id FROM users LIMIT 1")
    print(user_id)
    await conn.close()

asyncio.run(main())
