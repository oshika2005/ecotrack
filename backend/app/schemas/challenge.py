"""Pydantic schemas for Challenges and Gamification."""

from datetime import date, datetime
from pydantic import BaseModel


class ChallengeResponse(BaseModel):
    id: str
    title: str
    description: str
    points_reward: int
    difficulty: str
    start_date: date
    end_date: date
    is_active: bool

    model_config = {"from_attributes": True}


class UserChallengeResponse(BaseModel):
    id: str
    challenge: ChallengeResponse
    status: str
    completed_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntryResponse(BaseModel):
    rank: int
    username: str
    total_points: int
    total_co2_saved_kg: float
    badge_level: str

    model_config = {"from_attributes": True}
