"""Leaderboard router – global rankings."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.challenge import LeaderboardEntryResponse

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])


@router.get("/", response_model=list[LeaderboardEntryResponse])
def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Get global leaderboard ranked by total points."""
    users = (
        db.query(User)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )

    return [
        LeaderboardEntryResponse(
            rank=i + 1,
            username=user.username,
            total_points=user.total_points,
            total_co2_saved_kg=round(user.sustainability_score, 2),
            badge_level=user.badge_level,
        )
        for i, user in enumerate(users)
    ]
