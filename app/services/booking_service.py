"""
Booking Service - Handles multi-step booking flow with concurrency control.

Booking Flow:
1. Select seat (creates pending booking with lock)
2. Add passenger info
3. Process payment
4. Confirm booking with PNR generation
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
import random

from app.database.models import Booking, Flight, User, BookingStatus
from app.schemas.booking import (
    SeatSelectionRequest, SeatSelectionResponse,
    PassengerInfoRequest, PassengerInfoResponse,
    PaymentRequest, PaymentResponse,
    BookingResponse, BookingFlightInfo,
    CancellationResponse
)
from app.services.pricing_engine import calculate_dynamic_price
from app.services.flight_service import get_booked_seats
from app.utils.pnr_generator import generate_pnr


def initiate_booking(
    db: Session,
    user: User,
    request: SeatSelectionRequest
) -> SeatSelectionResponse:
    """
    Step 1: Initiate booking by selecting a seat.
    Uses database transaction to prevent double booking.
    
    Args:
        db: Database session
        user: Authenticated user
        request: Seat selection request
    
    Returns:
        SeatSelectionResponse with booking ID and price
    
    Raises:
        HTTPException: If seat is unavailable or flight not found
    """
    # Start transaction
    try:
        # Get flight with row lock (FOR UPDATE equivalent in SQLite)
        flight = db.query(Flight).filter(Flight.id == request.flight_id).first()
        
        if not flight:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flight not found"
            )
        
        # Check if flight has departed
        if flight.departure_time <= datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot book a flight that has already departed"
            )
        
        # Check seat availability
        if flight.available_seats <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No seats available on this flight"
            )
        
        # Check if seat is already booked
        booked_seats = get_booked_seats(db, request.flight_id)
        if request.seat_no in booked_seats:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Seat {request.seat_no} is already booked"
            )
        
        # Validate seat number format
        if not _is_valid_seat(request.seat_no, flight.total_seats):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid seat number: {request.seat_no}"
            )
        
        # Check if user already has a pending booking for this flight
        existing_pending = db.query(Booking).filter(
            Booking.user_id == user.id,
            Booking.flight_id == request.flight_id,
            Booking.status == BookingStatus.PENDING.value
        ).first()
        
        if existing_pending:
            # Cancel the old pending booking
            existing_pending.status = BookingStatus.CANCELLED.value
        
        # Calculate current dynamic price
        dynamic_price = calculate_dynamic_price(flight)
        
        # Create pending booking
        booking = Booking(
            user_id=user.id,
            flight_id=request.flight_id,
            seat_no=request.seat_no,
            final_price=dynamic_price,
            status=BookingStatus.PENDING.value
        )
        
        db.add(booking)
        
        # Decrement available seats
        flight.available_seats -= 1
        
        db.commit()
        db.refresh(booking)
        
        return SeatSelectionResponse(
            booking_id=booking.id,
            flight_id=booking.flight_id,
            seat_no=booking.seat_no,
            status=booking.status,
            dynamic_price=dynamic_price,
            message=f"Seat {request.seat_no} reserved. Please complete booking within 15 minutes."
        )
    
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Seat was just booked by another user. Please select a different seat."
        )


def add_passenger_info(
    db: Session,
    user: User,
    booking_id: str,
    request: PassengerInfoRequest
) -> PassengerInfoResponse:
    """
    Step 2: Add passenger information to the booking.
    
    Args:
        db: Database session
        user: Authenticated user
        booking_id: ID of the pending booking
        request: Passenger information
    
    Returns:
        PassengerInfoResponse confirming info added
    """
    booking = _get_user_booking(db, user.id, booking_id)
    
    if booking.status != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot add passenger info. Booking status is: {booking.status}"
        )
    
    # Update booking with passenger info
    booking.passenger_name = request.passenger_name
    booking.passenger_email = request.passenger_email
    booking.status = BookingStatus.INFO_ADDED.value
    
    db.commit()
    db.refresh(booking)
    
    return PassengerInfoResponse(
        booking_id=booking.id,
        passenger_name=booking.passenger_name,
        passenger_email=booking.passenger_email,
        status=booking.status,
        message="Passenger information added. Please proceed to payment."
    )


def process_payment(
    db: Session,
    user: User,
    booking_id: str,
    request: PaymentRequest
) -> PaymentResponse:
    """
    Step 3: Process payment (simulated).
    
    Simulates payment with 90% success rate.
    On success, generates PNR and confirms booking.
    On failure, marks booking as failed.
    
    Args:
        db: Database session
        user: Authenticated user
        booking_id: ID of the booking
        request: Payment details
    
    Returns:
        PaymentResponse with result and PNR on success
    """
    booking = _get_user_booking(db, user.id, booking_id)
    
    if booking.status not in [BookingStatus.PENDING.value, BookingStatus.INFO_ADDED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot process payment. Booking status is: {booking.status}"
        )
    
    # Validate payment details (basic validation)
    if not _validate_card(request):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid card details"
        )
    
    # Simulate payment processing (90% success rate)
    payment_success = random.random() < 0.9
    
    if payment_success:
        # Generate unique PNR
        pnr = generate_pnr(db)
        
        # Confirm booking
        booking.pnr = pnr
        booking.status = BookingStatus.CONFIRMED.value
        booking.booking_date = datetime.now()
        
        db.commit()
        db.refresh(booking)
        
        return PaymentResponse(
            booking_id=booking.id,
            pnr=pnr,
            status=booking.status,
            payment_status="SUCCESS",
            final_price=booking.final_price,
            message=f"Payment successful! Your PNR is: {pnr}"
        )
    else:
        # Payment failed - release the seat
        flight = db.query(Flight).filter(Flight.id == booking.flight_id).first()
        if flight:
            flight.available_seats += 1
        
        booking.status = BookingStatus.FAILED.value
        
        db.commit()
        db.refresh(booking)
        
        return PaymentResponse(
            booking_id=booking.id,
            pnr=None,
            status=booking.status,
            payment_status="FAILED",
            final_price=booking.final_price,
            message="Payment failed. Please try again."
        )


def get_booking_by_id(db: Session, user: User, booking_id: str) -> BookingResponse:
    """Get booking details by ID."""
    booking = _get_user_booking(db, user.id, booking_id)
    return _booking_to_response(booking)


def get_booking_by_pnr(db: Session, pnr: str) -> Optional[BookingResponse]:
    """Get booking details by PNR (public lookup)."""
    booking = db.query(Booking).filter(Booking.pnr == pnr.upper()).first()
    
    if not booking:
        return None
    
    return _booking_to_response(booking)


def get_user_bookings(db: Session, user: User) -> List[BookingResponse]:
    """Get all bookings for a user."""
    bookings = db.query(Booking).filter(
        Booking.user_id == user.id
    ).order_by(Booking.created_at.desc()).all()
    
    return [_booking_to_response(b) for b in bookings]


def cancel_booking(db: Session, user: User, booking_id: str) -> CancellationResponse:
    """
    Cancel a booking.
    
    Only confirmed bookings can be cancelled.
    Releases the seat back to availability.
    """
    booking = _get_user_booking(db, user.id, booking_id)
    
    if booking.status == BookingStatus.CANCELLED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )
    
    if booking.status == BookingStatus.FAILED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a failed booking"
        )
    
    # Release the seat
    flight = db.query(Flight).filter(Flight.id == booking.flight_id).first()
    if flight and booking.status in [BookingStatus.PENDING.value, BookingStatus.INFO_ADDED.value, BookingStatus.CONFIRMED.value]:
        flight.available_seats += 1
    
    # Calculate refund (if confirmed booking)
    refund_amount = None
    if booking.status == BookingStatus.CONFIRMED.value and booking.final_price:
        # 80% refund for cancellations
        refund_amount = round(booking.final_price * 0.8, 2)
    
    booking.status = BookingStatus.CANCELLED.value
    
    db.commit()
    db.refresh(booking)
    
    return CancellationResponse(
        booking_id=booking.id,
        pnr=booking.pnr,
        status=booking.status,
        message="Booking cancelled successfully",
        refund_amount=refund_amount
    )


# Helper functions

def _get_user_booking(db: Session, user_id: str, booking_id: str) -> Booking:
    """Get a booking belonging to a specific user."""
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user_id
    ).first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return booking


def _is_valid_seat(seat_no: str, total_seats: int) -> bool:
    """Validate seat number format and range."""
    if not seat_no or len(seat_no) < 2:
        return False
    
    try:
        row = int(seat_no[:-1])
        col = seat_no[-1].upper()
        
        max_rows = (total_seats + 5) // 6
        
        return row >= 1 and row <= max_rows and col in 'ABCDEF'
    except ValueError:
        return False


def _validate_card(request: PaymentRequest) -> bool:
    """Basic card validation (simulated)."""
    # Check card number length
    if len(request.card_number) != 16:
        return False
    
    # Check if all digits
    if not request.card_number.isdigit():
        return False
    
    # Check expiry
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    if request.expiry_year < current_year:
        return False
    if request.expiry_year == current_year and request.expiry_month < current_month:
        return False
    
    return True


def _booking_to_response(booking: Booking) -> BookingResponse:
    """Convert Booking model to BookingResponse schema."""
    flight_info = None
    if booking.flight:
        flight_info = BookingFlightInfo(
            flight_number=booking.flight.flight_number,
            airline=booking.flight.airline,
            source=booking.flight.source,
            destination=booking.flight.destination,
            departure_time=booking.flight.departure_time,
            arrival_time=booking.flight.arrival_time
        )
    
    return BookingResponse(
        id=booking.id,
        pnr=booking.pnr,
        user_id=booking.user_id,
        flight_id=booking.flight_id,
        seat_no=booking.seat_no,
        passenger_name=booking.passenger_name,
        passenger_email=booking.passenger_email,
        final_price=booking.final_price,
        status=booking.status,
        booking_date=booking.booking_date,
        created_at=booking.created_at,
        flight=flight_info
    )
