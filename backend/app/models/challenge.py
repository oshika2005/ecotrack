"""Challenge and UserChallenge models – weekly eco challenges with gamification."""

import uuid
from datetime import datetime, date, timezone

from sqlalchemy import String, Integer, DateTime, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    points_reward: Mapped[int] = mapped_column(Integer, default=100)
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")  # easy, medium, hard
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user_challenges = relationship("UserChallenge", back_populates="challenge", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Challenge '{self.title}'>"


class UserChallenge(Base):
    __tablename__ = "user_challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    challenge_id: Mapped[str] = mapped_column(String(36), ForeignKey("challenges.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), default="in_progress")  # in_progress, completed, failed

    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="user_challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")

    def __repr__(self) -> str:
        return f"<UserChallenge user={self.user_id} challenge={self.challenge_id} status={self.status}>"
