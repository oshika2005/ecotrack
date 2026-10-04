"""Activity model – eco-friendly actions logged by users."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Float, Integer, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    activity_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # walking, recycling, reduced_electricity, etc.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    co2_saved_kg: Mapped[float] = mapped_column(Float, default=0.0)
    points_earned: Mapped[int] = mapped_column(Integer, default=0)
    activity_date: Mapped[date] = mapped_column(Date, default=lambda: datetime.now(timezone.utc).date())

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="activities")

    def __repr__(self) -> str:
        return f"<Activity {self.activity_type} by user {self.user_id}>"
