"""
Flight Routes - API endpoints for flight search and details.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Flight
from app.schemas.flight import (
    FlightListResponse, FlightDetailResponse, 
    FareHistoryResponse, FlightResponse
)
from app.services import flight_service
from app.services.pricing_engine import get_pricing_breakdown

router = APIRouter(prefix="/api/flights", tags=["Flights"])


@router.get("", response_model=FlightListResponse)
def search_flights(
    source: Optional[str] = Query(None, description="Departure city"),
    destination: Optional[str] = Query(None, description="Arrival city"),
    departure_date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    db: Session = Depends(get_db)
):
    """
    Search for available flights with optional filters.
    
    - **source**: Filter by departure city (partial match)
    - **destination**: Filter by arrival city (partial match)
    - **departure_date**: Filter by departure date
    - **min_price**: Filter by minimum base price
    - **max_price**: Filter by maximum base price
    
    Returns list of flights with dynamic pricing applied.
    """
    flights = flight_service.search_flights(
        db,
        source=source,
        destination=destination,
        departure_date=departure_date,
        min_price=min_price,
        max_price=max_price
    )
    
    return FlightListResponse(
        flights=flights,
        total_count=len(flights)
    )


@router.get("/{flight_id}", response_model=FlightDetailResponse)
def get_flight_details(
    flight_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific flight.
    
    Includes:
    - Flight information
    - Dynamic pricing
    - List of available seats
    """
    flight_details = flight_service.get_flight_details(db, flight_id)
    
    if not flight_details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    return flight_details


@router.get("/{flight_id}/seats", response_model=dict)
def get_available_seats(
    flight_id: str,
    db: Session = Depends(get_db)
):
    """
    Get available seats for a flight.
    
    Returns:
    - Total seats
    - Available seats count
    - List of available seat numbers
    - List of booked seat numbers
    """
    flight = flight_service.get_flight_by_id(db, flight_id)
    
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    booked_seats = flight_service.get_booked_seats(db, flight_id)
    all_seats = flight_service.generate_seat_numbers(flight.total_seats)
    available_seats = [seat for seat in all_seats if seat not in booked_seats]
    
    return {
        "flight_id": flight_id,
        "flight_number": flight.flight_number,
        "total_seats": flight.total_seats,
        "available_count": len(available_seats),
        "available_seats": available_seats,
        "booked_seats": booked_seats
    }


@router.get("/{flight_id}/price-history", response_model=FareHistoryResponse)
def get_price_history(
    flight_id: str,
    db: Session = Depends(get_db)
):
    """
    Get fare history for a flight.
    
    Shows how the price has changed over time based on:
    - Demand fluctuations
    - Seat availability changes
    """
    flight = flight_service.get_flight_by_id(db, flight_id)
    
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    history = flight_service.get_fare_history(db, flight_id)
    
    return FareHistoryResponse(
        flight_id=flight_id,
        flight_number=flight.flight_number,
        history=history
    )


@router.get("/{flight_id}/pricing", response_model=dict)
def get_pricing_details(
    flight_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed pricing breakdown for a flight.
    
    Shows how the dynamic price is calculated:
    - Base price
    - Seat availability factor
    - Time to departure factor
    - Demand factor
    """
    flight = flight_service.get_flight_by_id(db, flight_id)
    
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flight not found"
        )
    
    return {
        "flight_id": flight_id,
        "flight_number": flight.flight_number,
        **get_pricing_breakdown(flight)
    }
