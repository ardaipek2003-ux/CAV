"""
CAV Algorithm Service
FastAPI microservice handling quote, confirm, and optimize operations.
"""

import os
import asyncpg
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from quote import router as quote_router
from confirm import router as confirm_router
from optimizer import router as optimizer_router

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://vfarm:vfarm_secret@localhost:5432/vertical_farm")

# Global connection pool
pool: asyncpg.Pool | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database connection pool lifecycle."""
    global pool
    pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=5,
        max_size=20,
    )
    print(f"OK Database pool created (min=5, max=20)")
    app.state.pool = pool
    yield
    await pool.close()
    print("Database pool closed")


app = FastAPI(
    title="CAV Algorithm Service",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("NEXTJS_ORIGIN", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quote_router)
app.include_router(confirm_router)
app.include_router(optimizer_router)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "vertical-farm-algorithm"}
