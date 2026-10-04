"""Pydantic schemas for Carbon Footprint Calculator."""

from datetime import date, datetime
from pydantic import BaseModel, Field


class CarbonCalculateRequest(BaseModel):
    electricity_kwh: float = Field(ge=0, default=0.0, description="Daily electricity usage in kWh")
    food_type: str = Field(
        default="veg",
        description="Food type: veg, non-veg, vegan",
    )
    travel_mode: str = Field(
        default="walk",
        description="Travel mode: car, bike, bus, train, flight, walk",
    )
    travel_distance_km: float = Field(ge=0, default=0.0, description="Distance traveled in km")
    log_date: date | None = None


class CarbonBreakdown(BaseModel):
    electricity_co2_kg: float
    food_co2_kg: float
    travel_co2_kg: float
    total_co2_kg: float


class CarbonSuggestion(BaseModel):
    category: str
    current_impact: str
    suggestion: str
    potential_saving_kg: float


class CarbonCalculateResponse(BaseModel):
    id: str
    breakdown: CarbonBreakdown
    suggestions: list[CarbonSuggestion]
    comparison: dict  # vs average, vs last entry
    log_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class CarbonTrend(BaseModel):
    dates: list[str]
    total_co2: list[float]
    electricity_co2: list[float]
    food_co2: list[float]
    travel_co2: list[float]
