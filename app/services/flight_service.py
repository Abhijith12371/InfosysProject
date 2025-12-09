"""
Flight Service - Handles flight search, details, and availability.
"""

from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database.models import Flight, Booking, FareHistory, BookingStatus
from app.schemas.flight import FlightResponse, FlightDetailResponse, FareHistoryItem
from app.services.pricing_engine import calculate_dynamic_price


def search_flights(
    db: Session,
    source: Optional[str] = None,
    destination: Optional[str] = None,
    departure_date: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
) -> List[FlightResponse]:
    """
    Search for flights with optional filters.
    
    Args:
        db: Database session
        source: Filter by departure city
        destination: Filter by arrival city
        departure_date: Filter by date (YYYY-MM-DD)
        min_price: Minimum base price filter
        max_price: Maximum base price filter
    
    Returns:
        List of FlightResponse objects with dynamic pricing
    """
    query = db.query(Flight)
    
    # Apply filters
    if source:
        query = query.filter(Flight.source.ilike(f"%{source}%"))
    
    if destination:
        query = query.filter(Flight.destination.ilike(f"%{destination}%"))
    
    if departure_date:
        try:
            date_obj = datetime.strptime(departure_date, "%Y-%m-%d")
            next_day = date_obj + timedelta(days=1)
            query = query.filter(
                and_(
                    Flight.departure_time >= date_obj,
                    Flight.departure_time < next_day
                )
            )
        except ValueError:
            pass  # Invalid date format, skip filter
    
    if min_price is not None:
        query = query.filter(Flight.base_price >= min_price)
    
    if max_price is not None:
        query = query.filter(Flight.base_price <= max_price)
    
    # Only show future flights with available seats
    query = query.filter(
        Flight.departure_time > datetime.now(),
        Flight.available_seats > 0
    )
    
    # Order by departure time
    query = query.order_by(Flight.departure_time)
    
    flights = query.all()
    
    # Convert to response with dynamic pricing
    return [_flight_to_response(flight) for flight in flights]


def get_flight_by_id(db: Session, flight_id: str) -> Optional[Flight]:
    """Get a flight by its ID."""
    return db.query(Flight).filter(Flight.id == flight_id).first()


def get_flight_details(db: Session, flight_id: str) -> Optional[FlightDetailResponse]:
    """
    Get detailed flight information including available seats.
    
    Args:
        db: Database session
        flight_id: Flight ID
    
    Returns:
        FlightDetailResponse with seat availability or None
    """
    flight = get_flight_by_id(db, flight_id)
    if not flight:
        return None
    
    # Get booked seats for this flight
    booked_seats = get_booked_seats(db, flight_id)
    
    # Generate all possible seats and filter out booked ones
    all_seats = generate_seat_numbers(flight.total_seats)
    available_seats = [seat for seat in all_seats if seat not in booked_seats]
    
    duration = int((flight.arrival_time - flight.departure_time).total_seconds() / 60)
    
    return FlightDetailResponse(
        id=flight.id,
        flight_number=flight.flight_number,
        airline=flight.airline,
        source=flight.source,
        destination=flight.destination,
        departure_time=flight.departure_time,
        arrival_time=flight.arrival_time,
        base_price=flight.base_price,
        dynamic_price=calculate_dynamic_price(flight),
        total_seats=flight.total_seats,
        available_seats=flight.available_seats,
        available_seat_list=available_seats
    )


def get_booked_seats(db: Session, flight_id: str) -> List[str]:
    """Get list of already booked seat numbers for a flight."""
    bookings = db.query(Booking).filter(
        Booking.flight_id == flight_id,
        Booking.status.notin_([BookingStatus.CANCELLED.value, BookingStatus.FAILED.value])
    ).all()
    
    return [booking.seat_no for booking in bookings]


def generate_seat_numbers(total_seats: int) -> List[str]:
    """
    Generate seat numbers based on total seats.
    Format: Row number (1-30) + Column letter (A-F)
    
    Example: 1A, 1B, 1C, 1D, 1E, 1F, 2A, 2B, ...
    """
    seats = []
    columns = ['A', 'B', 'C', 'D', 'E', 'F']  # 6 seats per row
    rows_needed = (total_seats + 5) // 6  # Ceiling division
    
    for row in range(1, rows_needed + 1):
        for col in columns:
            if len(seats) < total_seats:
                seats.append(f"{row}{col}")
    
    return seats


def get_fare_history(db: Session, flight_id: str) -> List[FareHistoryItem]:
    """
    Get fare history for a flight.
    
    Args:
        db: Database session
        flight_id: Flight ID
    
    Returns:
        List of FareHistoryItem objects ordered by recorded time
    """
    history = db.query(FareHistory).filter(
        FareHistory.flight_id == flight_id
    ).order_by(FareHistory.recorded_at.desc()).limit(50).all()
    
    return [
        FareHistoryItem(
            price=h.price,
            demand_factor=h.demand_factor,
            available_seats=h.available_seats,
            recorded_at=h.recorded_at
        )
        for h in history
    ]


def record_fare_history(db: Session, flight: Flight) -> None:
    """Record current fare for history tracking."""
    history = FareHistory(
        flight_id=flight.id,
        price=calculate_dynamic_price(flight),
        demand_factor=flight.demand_factor,
        available_seats=flight.available_seats
    )
    db.add(history)
    db.commit()


def _flight_to_response(flight: Flight) -> FlightResponse:
    """Convert Flight model to FlightResponse schema."""
    duration = int((flight.arrival_time - flight.departure_time).total_seconds() / 60)
    
    return FlightResponse(
        id=flight.id,
        flight_number=flight.flight_number,
        airline=flight.airline,
        source=flight.source,
        destination=flight.destination,
        departure_time=flight.departure_time,
        arrival_time=flight.arrival_time,
        base_price=flight.base_price,
        dynamic_price=calculate_dynamic_price(flight),
        total_seats=flight.total_seats,
        available_seats=flight.available_seats,
        duration_minutes=duration
    )
