"""Pydantic schemas for Activity endpoints."""

from datetime import date, datetime
from pydantic import BaseModel, Field


class ActivityCreate(BaseModel):
    activity_type: str = Field(
        description="Type: walking, cycling, recycling, reduced_electricity, public_transport, composting, tree_planting, vegan_meal, carpooling, water_saving"
    )
    description: str | None = None
    activity_date: date | None = None


class ActivityResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    description: str | None = None
    co2_saved_kg: float
    points_earned: int
    activity_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityStats(BaseModel):
    total_activities: int
    total_co2_saved_kg: float
    total_points: int
    activities_by_type: dict[str, int]
