"""Carbon Log model – daily carbon footprint entries with AI suggestions."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Float, DateTime, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CarbonLog(Base):
    __tablename__ = "carbon_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    # Input fields
    electricity_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    food_type: Mapped[str] = mapped_column(String(20), default="veg")  # veg, non-veg, vegan
    travel_mode: Mapped[str] = mapped_column(String(30), default="walk")  # car, bike, bus, train, flight, walk
    travel_distance_km: Mapped[float] = mapped_column(Float, default=0.0)

    # Calculated output
    total_co2_kg: Mapped[float] = mapped_column(Float, default=0.0)
    electricity_co2_kg: Mapped[float] = mapped_column(Float, default=0.0)
    food_co2_kg: Mapped[float] = mapped_column(Float, default=0.0)
    travel_co2_kg: Mapped[float] = mapped_column(Float, default=0.0)

    # AI-generated suggestions stored as JSON
    ai_suggestions: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    log_date: Mapped[date] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date(), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="carbon_logs")

    def __repr__(self) -> str:
        return f"<CarbonLog {self.total_co2_kg}kg CO₂ on {self.log_date}>"
