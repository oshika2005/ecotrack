"""Pydantic schemas for Community Hub – posts and comments."""

from datetime import datetime
from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)


class CommentResponse(BaseModel):
    id: str
    user_id: str
    username: str | None = None
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    id: str
    user_id: str
    username: str | None = None
    content: str
    likes_count: int
    comments_count: int
    is_moderated: bool
    comments: list[CommentResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}
