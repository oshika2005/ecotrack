"""Carbon Credit Marketplace router – list, buy, sell carbon offsets."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.carbon_credit import CarbonCredit
from app.schemas.credit import CreditCreate, CreditResponse, PurchaseRequest
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])


@router.post("/credits", response_model=CreditResponse, status_code=201)
def list_credit(
    payload: CreditCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List a carbon credit for sale."""
    credit = CarbonCredit(
        seller_id=current_user.id,
        title=payload.title,
        description=payload.description,
        tons_co2=payload.tons_co2,
        price_usd=payload.price_usd,
    )
    db.add(credit)
    db.commit()
    db.refresh(credit)
    return CreditResponse.model_validate(credit)


@router.get("/credits", response_model=list[CreditResponse])
def browse_credits(
    status: str = Query("available"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Browse available carbon credits."""
    credits = (
        db.query(CarbonCredit)
        .filter(CarbonCredit.status == status)
        .order_by(CarbonCredit.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [CreditResponse.model_validate(c) for c in credits]


@router.post("/credits/purchase", response_model=CreditResponse)
def purchase_credit(
    payload: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Purchase a carbon credit (mock payment)."""
    credit = db.query(CarbonCredit).filter(CarbonCredit.id == payload.credit_id).first()
    if not credit:
        raise HTTPException(status_code=404, detail="Credit not found")
    if credit.status != "available":
        raise HTTPException(status_code=400, detail="Credit is no longer available")
    if credit.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own credit")

    credit.buyer_id = current_user.id
    credit.status = "sold"
    credit.purchased_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(credit)
    return CreditResponse.model_validate(credit)


@router.get("/my-credits", response_model=list[CreditResponse])
def my_credits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get credits sold or purchased by the current user."""
    credits = (
        db.query(CarbonCredit)
        .filter(
            (CarbonCredit.seller_id == current_user.id)
            | (CarbonCredit.buyer_id == current_user.id)
        )
        .order_by(CarbonCredit.created_at.desc())
        .all()
    )
    return [CreditResponse.model_validate(c) for c in credits]
