"""Activities router – log eco-friendly actions and view stats."""

from datetime import date, timezone, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityResponse, ActivityStats
from app.utils.security import get_current_user
from app.utils.helpers import get_activity_reward, calculate_badge

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.post("/", response_model=ActivityResponse, status_code=201)
def log_activity(
    payload: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log an eco-friendly activity and earn points."""
    points, co2_saved = get_activity_reward(payload.activity_type)

    activity = Activity(
        user_id=current_user.id,
        activity_type=payload.activity_type,
        description=payload.description,
        co2_saved_kg=co2_saved,
        points_earned=points,
        activity_date=payload.activity_date or date.today(),
    )
    db.add(activity)

    # Update user totals
    current_user.total_points += points
    current_user.sustainability_score += co2_saved
    current_user.badge_level = calculate_badge(current_user.total_points)

    db.commit()
    db.refresh(activity)
    return ActivityResponse.model_validate(activity)


@router.get("/", response_model=list[ActivityResponse])
def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the current user's activities (newest first)."""
    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [ActivityResponse.model_validate(a) for a in activities]


@router.get("/stats", response_model=ActivityStats)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get aggregated activity statistics for the current user."""
    activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()

    by_type: dict[str, int] = {}
    total_co2 = 0.0
    total_pts = 0
    for a in activities:
        by_type[a.activity_type] = by_type.get(a.activity_type, 0) + 1
        total_co2 += a.co2_saved_kg
        total_pts += a.points_earned

    return ActivityStats(
        total_activities=len(activities),
        total_co2_saved_kg=round(total_co2, 2),
        total_points=total_pts,
        activities_by_type=by_type,
    )
