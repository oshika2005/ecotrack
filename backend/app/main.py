"""
EcoTrack – AI-Powered Carbon Footprint Tracker
FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from datetime import date, timedelta

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base, SessionLocal

# Import all models so SQLAlchemy registers them
from app.models.user import User
from app.models.activity import Activity
from app.models.carbon_log import CarbonLog
from app.models.challenge import Challenge, UserChallenge
from app.models.post import Post, Comment
from app.models.carbon_credit import CarbonCredit
from app.models.leaderboard import LeaderboardEntry

# Import routers
from app.routers import auth, activities, carbon, challenges, community, leaderboard, marketplace


def seed_challenges(db):
    """Seed initial challenges if the table is empty."""
    if db.query(Challenge).count() > 0:
        return

    today = date.today()
    sample_challenges = [
        Challenge(
            title="Walk to Work Week",
            description="Walk or bike to work every day for a week. Track each trip as a 'walking' or 'cycling' activity.",
            points_reward=200,
            difficulty="medium",
            start_date=today,
            end_date=today + timedelta(days=7),
        ),
        Challenge(
            title="Meatless Monday Champion",
            description="Go vegetarian or vegan every Monday for a month. Log your meals in the carbon calculator.",
            points_reward=150,
            difficulty="easy",
            start_date=today,
            end_date=today + timedelta(days=30),
        ),
        Challenge(
            title="Energy Saver Sprint",
            description="Reduce your daily electricity usage below 8 kWh for 5 consecutive days.",
            points_reward=250,
            difficulty="medium",
            start_date=today,
            end_date=today + timedelta(days=14),
        ),
        Challenge(
            title="Zero Waste Warrior",
            description="Log a recycling activity every day for two weeks. Bonus points for composting!",
            points_reward=300,
            difficulty="hard",
            start_date=today,
            end_date=today + timedelta(days=14),
        ),
        Challenge(
            title="Plant a Tree",
            description="Plant a tree and log it as a 'tree_planting' activity. Share a photo in the community!",
            points_reward=500,
            difficulty="easy",
            start_date=today,
            end_date=today + timedelta(days=90),
        ),
        Challenge(
            title="Public Transport Pro",
            description="Use public transport for all trips over 2 km for an entire week.",
            points_reward=180,
            difficulty="medium",
            start_date=today,
            end_date=today + timedelta(days=7),
        ),
    ]

    for c in sample_challenges:
        db.add(c)
    db.commit()
    print(f"[OK] Seeded {len(sample_challenges)} challenges")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed data on startup."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created")

    db = SessionLocal()
    try:
        seed_challenges(db)
    finally:
        db.close()

    yield  # App runs here

    print("[INFO] EcoTrack shutting down")


# ── Create FastAPI app ───────────────────────────────────────────

app = FastAPI(
    title="EcoTrack API",
    description="AI-Powered Carbon Footprint Tracker – Track, reduce, and offset your carbon footprint.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ─────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(activities.router)
app.include_router(carbon.router)
app.include_router(challenges.router)
app.include_router(community.router)
app.include_router(leaderboard.router)
app.include_router(marketplace.router)


# ── Health check ──────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health", tags=["Health"])
def api_health():
    return {"status": "ok", "message": "EcoTrack API is running"}
