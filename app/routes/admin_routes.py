"""
Admin Routes - Endpoints for admin management of flights, bookings, and users.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database.connection import get_db
from app.database.models import User, Flight, Booking, BookingStatus
from app.utils.auth import get_current_user
from app.schemas.booking import BookingResponse
from app.services.booking_service import _booking_to_response


router = APIRouter(prefix="/api/admin", tags=["admin"])


# Pydantic models for admin operations
class AdminStats(BaseModel):
    total_users: int
    total_flights: int
    total_bookings: int
    confirmed_bookings: int
    total_revenue: float
    pending_bookings: int


class FlightCreate(BaseModel):
    flight_number: str
    airline: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    base_price: float
    total_seats: int = 180


class FlightUpdate(BaseModel):
    airline: Optional[str] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    base_price: Optional[float] = None
    total_seats: Optional[int] = None
    demand_factor: Optional[float] = None


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    mobile_no: Optional[str]
    is_admin: int
    created_at: datetime
    booking_count: int


class BookingAdminUpdate(BaseModel):
    status: Optional[str] = None


# Admin middleware
def require_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# Dashboard Stats
@router.get("/stats", response_model=AdminStats)
def get_admin_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Get dashboard statistics for admin."""
    total_users = db.query(User).count()
    total_flights = db.query(Flight).count()
    total_bookings = db.query(Booking).count()
    confirmed_bookings = db.query(Booking).filter(
        Booking.status == BookingStatus.CONFIRMED.value
    ).count()
    pending_bookings = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.INFO_ADDED.value])
    ).count()
    
    # Calculate revenue
    revenue_result = db.query(Booking).filter(
        Booking.status == BookingStatus.CONFIRMED.value
    ).all()
    total_revenue = sum(b.final_price or 0 for b in revenue_result)
    
    return AdminStats(
        total_users=total_users,
        total_flights=total_flights,
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        total_revenue=total_revenue,
        pending_bookings=pending_bookings
    )


# User Management
@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Get all users with their booking counts."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            mobile_no=u.mobile_no,
            is_admin=u.is_admin or 0,
            created_at=u.created_at,
            booking_count=len(u.bookings)
        )
        for u in users
    ]


@router.put("/users/{user_id}/toggle-admin")
def toggle_admin_status(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Toggle admin status for a user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot modify your own admin status")
    
    user.is_admin = 0 if user.is_admin else 1
    db.commit()
    
    return {"message": f"Admin status {'granted' if user.is_admin else 'revoked'} for {user.email}"}


# Booking Management
@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Get all bookings with optional status filter."""
    query = db.query(Booking).order_by(Booking.created_at.desc())
    
    if status_filter:
        query = query.filter(Booking.status == status_filter.upper())
    
    bookings = query.all()
    return [_booking_to_response(b) for b in bookings]


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: str,
    update: BookingAdminUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update booking status (admin override)."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    valid_statuses = [s.value for s in BookingStatus]
    if update.status and update.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    if update.status:
        booking.status = update.status.upper()
    
    db.commit()
    
    return {"message": f"Booking {booking_id} updated to status {booking.status}"}


# Flight Management
@router.get("/flights")
def get_all_flights_admin(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    """Get all flights for admin management."""
    flights = db.query(Flight).order_by(Flight.departure_time.desc()).all()
    return [
        {
            "id": f.id,
            "flight_number": f.flight_number,
            "airline": f.airline,
            "source": f.source,
            "destination": f.destination,
            "departure_time": f.departure_time,
            "arrival_time": f.arrival_time,
            "base_price": f.base_price,
            "total_seats": f.total_seats,
            "available_seats": f.available_seats,
            "demand_factor": f.demand_factor,
            "bookings_count": len(f.bookings)
        }
        for f in flights
    ]


@router.post("/flights")
def create_flight(
    flight_data: FlightCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Create a new flight."""
    # Check if flight number already exists
    existing = db.query(Flight).filter(Flight.flight_number == flight_data.flight_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Flight number already exists")
    
    flight = Flight(
        flight_number=flight_data.flight_number,
        airline=flight_data.airline,
        source=flight_data.source,
        destination=flight_data.destination,
        departure_time=flight_data.departure_time,
        arrival_time=flight_data.arrival_time,
        base_price=flight_data.base_price,
        total_seats=flight_data.total_seats,
        available_seats=flight_data.total_seats,
        demand_factor=1.0
    )
    
    db.add(flight)
    db.commit()
    db.refresh(flight)
    
    return {"message": "Flight created successfully", "flight_id": flight.id}


@router.put("/flights/{flight_id}")
def update_flight(
    flight_id: str,
    update: FlightUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Update flight details."""
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    update_data = update.dict(exclude_none=True)
    for key, value in update_data.items():
        setattr(flight, key, value)
    
    db.commit()
    
    return {"message": f"Flight {flight.flight_number} updated successfully"}


@router.delete("/flights/{flight_id}")
def delete_flight(
    flight_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Delete a flight (only if no bookings)."""
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    if flight.bookings:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete flight with existing bookings"
        )
    
    db.delete(flight)
    db.commit()
    
    return {"message": f"Flight {flight.flight_number} deleted successfully"}
