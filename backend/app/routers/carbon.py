"""Carbon footprint calculator router – calculate emissions and get AI suggestions."""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.carbon_log import CarbonLog
from app.schemas.carbon import (
    CarbonCalculateRequest,
    CarbonCalculateResponse,
    CarbonBreakdown,
    CarbonTrend,
)
from app.utils.security import get_current_user
from app.ai.carbon_calculator import calculate_emissions
from app.ai.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/carbon", tags=["Carbon Calculator"])


@router.post("/calculate", response_model=CarbonCalculateResponse, status_code=201)
def calculate_footprint(
    payload: CarbonCalculateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate carbon footprint and save the log with AI suggestions."""
    # Calculate emissions
    emissions = calculate_emissions(
        payload.electricity_kwh,
        payload.food_type,
        payload.travel_mode,
        payload.travel_distance_km,
    )

    # Generate AI suggestions
    suggestions = recommendation_engine.get_recommendations(
        payload.electricity_kwh,
        payload.food_type,
        payload.travel_mode,
        payload.travel_distance_km,
        emissions,
    )

    # Compare with average
    comparison = recommendation_engine.get_comparison(emissions)

    # Save to database
    log = CarbonLog(
        user_id=current_user.id,
        electricity_kwh=payload.electricity_kwh,
        food_type=payload.food_type,
        travel_mode=payload.travel_mode,
        travel_distance_km=payload.travel_distance_km,
        total_co2_kg=emissions["total_co2_kg"],
        electricity_co2_kg=emissions["electricity_co2_kg"],
        food_co2_kg=emissions["food_co2_kg"],
        travel_co2_kg=emissions["travel_co2_kg"],
        ai_suggestions=suggestions,
        log_date=payload.log_date or date.today(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return CarbonCalculateResponse(
        id=log.id,
        breakdown=CarbonBreakdown(**emissions),
        suggestions=suggestions,
        comparison=comparison,
        log_date=log.log_date,
        created_at=log.created_at,
    )


@router.get("/history", response_model=list[CarbonCalculateResponse])
def get_carbon_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the user's carbon log history."""
    logs = (
        db.query(CarbonLog)
        .filter(CarbonLog.user_id == current_user.id)
        .order_by(CarbonLog.log_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    results = []
    for log in logs:
        breakdown = CarbonBreakdown(
            electricity_co2_kg=log.electricity_co2_kg,
            food_co2_kg=log.food_co2_kg,
            travel_co2_kg=log.travel_co2_kg,
            total_co2_kg=log.total_co2_kg,
        )
        comparison = recommendation_engine.get_comparison({
            "total_co2_kg": log.total_co2_kg,
        })
        results.append(CarbonCalculateResponse(
            id=log.id,
            breakdown=breakdown,
            suggestions=log.ai_suggestions or [],
            comparison=comparison,
            log_date=log.log_date,
            created_at=log.created_at,
        ))
    return results


@router.get("/trends", response_model=CarbonTrend)
def get_carbon_trends(
    days: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get carbon emission trends for charting."""
    logs = (
        db.query(CarbonLog)
        .filter(CarbonLog.user_id == current_user.id)
        .order_by(CarbonLog.log_date.asc())
        .limit(days)
        .all()
    )

    return CarbonTrend(
        dates=[str(log.log_date) for log in logs],
        total_co2=[log.total_co2_kg for log in logs],
        electricity_co2=[log.electricity_co2_kg for log in logs],
        food_co2=[log.food_co2_kg for log in logs],
        travel_co2=[log.travel_co2_kg for log in logs],
    )
