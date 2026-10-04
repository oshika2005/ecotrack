"""Challenges & Gamification router."""

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.challenge import Challenge, UserChallenge
from app.schemas.challenge import ChallengeResponse, UserChallengeResponse
from app.utils.security import get_current_user
from app.utils.helpers import calculate_badge

router = APIRouter(prefix="/api/challenges", tags=["Challenges"])


@router.get("/", response_model=list[ChallengeResponse])
def list_challenges(
    active_only: bool = Query(True),
    db: Session = Depends(get_db),
):
    """List available challenges."""
    query = db.query(Challenge)
    if active_only:
        query = query.filter(Challenge.is_active == True, Challenge.end_date >= date.today())
    return [ChallengeResponse.model_validate(c) for c in query.all()]


@router.post("/{challenge_id}/join", response_model=UserChallengeResponse, status_code=201)
def join_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Join a challenge."""
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")

    existing = (
        db.query(UserChallenge)
        .filter(UserChallenge.user_id == current_user.id, UserChallenge.challenge_id == challenge_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this challenge")

    uc = UserChallenge(user_id=current_user.id, challenge_id=challenge_id)
    db.add(uc)
    db.commit()
    db.refresh(uc)

    return UserChallengeResponse(
        id=uc.id,
        challenge=ChallengeResponse.model_validate(challenge),
        status=uc.status,
        completed_at=uc.completed_at,
        created_at=uc.created_at,
    )


@router.post("/{challenge_id}/complete", response_model=UserChallengeResponse)
def complete_challenge(
    challenge_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark a challenge as completed and earn points."""
    uc = (
        db.query(UserChallenge)
        .filter(UserChallenge.user_id == current_user.id, UserChallenge.challenge_id == challenge_id)
        .first()
    )
    if not uc:
        raise HTTPException(status_code=404, detail="You haven't joined this challenge")
    if uc.status == "completed":
        raise HTTPException(status_code=400, detail="Challenge already completed")

    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()

    uc.status = "completed"
    uc.completed_at = datetime.now(timezone.utc)

    # Award points
    current_user.total_points += challenge.points_reward
    current_user.badge_level = calculate_badge(current_user.total_points)

    db.commit()
    db.refresh(uc)

    return UserChallengeResponse(
        id=uc.id,
        challenge=ChallengeResponse.model_validate(challenge),
        status=uc.status,
        completed_at=uc.completed_at,
        created_at=uc.created_at,
    )


@router.get("/my", response_model=list[UserChallengeResponse])
def my_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's challenges."""
    ucs = db.query(UserChallenge).filter(UserChallenge.user_id == current_user.id).all()
    results = []
    for uc in ucs:
        challenge = db.query(Challenge).filter(Challenge.id == uc.challenge_id).first()
        results.append(UserChallengeResponse(
            id=uc.id,
            challenge=ChallengeResponse.model_validate(challenge),
            status=uc.status,
            completed_at=uc.completed_at,
            created_at=uc.created_at,
        ))
    return results
