"""
Booking Routes - API endpoints for the multi-step booking flow.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import User
from app.schemas.booking import (
    SeatSelectionRequest, SeatSelectionResponse,
    PassengerInfoRequest, PassengerInfoResponse,
    PaymentRequest, PaymentResponse,
    BookingResponse, BookingHistoryResponse,
    CancellationResponse
)
from app.services import booking_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


# ============ Multi-Step Booking Flow ============

@router.post("/select-seat", response_model=SeatSelectionResponse, status_code=status.HTTP_201_CREATED)
def select_seat(
    request: SeatSelectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Step 1: Select Flight & Seat**
    
    Initiates a booking by reserving a seat on a flight.
    The seat is locked for 15 minutes while you complete the booking.
    
    - **flight_id**: ID of the flight to book
    - **seat_no**: Seat number (e.g., "12A", "5C")
    
    Returns booking ID and current dynamic price.
    """
    return booking_service.initiate_booking(db, current_user, request)


@router.post("/{booking_id}/passenger", response_model=PassengerInfoResponse)
def add_passenger_info(
    booking_id: str,
    request: PassengerInfoRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Step 2: Add Passenger Information**
    
    Add passenger details to the booking.
    
    - **passenger_name**: Full name as per ID
    - **passenger_email**: Email for booking confirmation
    """
    return booking_service.add_passenger_info(db, current_user, booking_id, request)


@router.post("/{booking_id}/payment", response_model=PaymentResponse)
def process_payment(
    booking_id: str,
    request: PaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    **Step 3: Process Payment**
    
    Complete the booking by processing payment.
    This is a simulated payment with a 90% success rate.
    
    On success, a unique PNR is generated and the booking is confirmed.
    On failure, the seat is released and you can try again.
    
    - **card_number**: 16-digit card number
    - **expiry_month**: Card expiry month (1-12)
    - **expiry_year**: Card expiry year
    - **cvv**: 3 or 4 digit CVV
    """
    return booking_service.process_payment(db, current_user, booking_id, request)


# ============ Booking Retrieval ============

@router.get("/history", response_model=BookingHistoryResponse)
def get_booking_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all bookings for the current user.
    
    Returns bookings ordered by creation date (newest first).
    """
    bookings = booking_service.get_user_bookings(db, current_user)
    
    return BookingHistoryResponse(
        bookings=bookings,
        total_count=len(bookings)
    )


@router.get("/pnr/{pnr}", response_model=BookingResponse)
def get_booking_by_pnr(
    pnr: str,
    db: Session = Depends(get_db)
):
    """
    Look up a booking by PNR.
    
    This is a public endpoint - no authentication required.
    Enter your 6-character PNR to retrieve booking details.
    """
    booking = booking_service.get_booking_by_pnr(db, pnr)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No booking found with PNR: {pnr}"
        )
    
    return booking


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get booking details by ID.
    
    Only the booking owner can view their booking.
    """
    return booking_service.get_booking_by_id(db, current_user, booking_id)


# ============ Booking Cancellation ============

@router.delete("/{booking_id}", response_model=CancellationResponse)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancel a booking.
    
    - Confirmed bookings receive an 80% refund
    - Pending bookings are cancelled without charge
    - The seat is released and becomes available again
    """
    return booking_service.cancel_booking(db, current_user, booking_id)
