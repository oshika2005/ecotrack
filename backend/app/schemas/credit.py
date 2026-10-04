"""Pydantic schemas for Carbon Credit Marketplace."""

from datetime import datetime
from pydantic import BaseModel, Field


class CreditCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    tons_co2: float = Field(gt=0)
    price_usd: float = Field(gt=0)


class CreditResponse(BaseModel):
    id: str
    seller_id: str
    buyer_id: str | None = None
    title: str
    description: str | None = None
    tons_co2: float
    price_usd: float
    status: str
    created_at: datetime
    purchased_at: datetime | None = None

    model_config = {"from_attributes": True}


class PurchaseRequest(BaseModel):
    credit_id: str
