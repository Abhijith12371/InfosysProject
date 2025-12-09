"""
Pydantic schemas for Booking-related request and response models.
Supports multi-step booking flow.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# Step 1: Seat Selection
class SeatSelectionRequest(BaseModel):
    """Schema for initiating a booking with seat selection."""
    flight_id: str = Field(..., description="ID of the flight to book")
    seat_no: str = Field(..., description="Seat number to reserve (e.g., '12A')")

    class Config:
        json_schema_extra = {
            "example": {
                "flight_id": "abc123-def456",
                "seat_no": "12A"
            }
        }


class SeatSelectionResponse(BaseModel):
    """Response after successful seat selection."""
    booking_id: str
    flight_id: str
    seat_no: str
    status: str
    dynamic_price: float
    message: str


# Step 2: Passenger Information
class PassengerInfoRequest(BaseModel):
    """Schema for adding passenger information to booking."""
    passenger_name: str = Field(..., min_length=2, max_length=100, description="Passenger's full name")
    passenger_email: EmailStr = Field(..., description="Passenger's email for confirmation")

    class Config:
        json_schema_extra = {
            "example": {
                "passenger_name": "John Doe",
                "passenger_email": "john.doe@example.com"
            }
        }


class PassengerInfoResponse(BaseModel):
    """Response after adding passenger info."""
    booking_id: str
    passenger_name: str
    passenger_email: str
    status: str
    message: str


# Step 3: Payment
class PaymentRequest(BaseModel):
    """Schema for payment processing (simulated)."""
    card_number: str = Field(..., min_length=16, max_length=16, description="16-digit card number")
    expiry_month: int = Field(..., ge=1, le=12, description="Card expiry month")
    expiry_year: int = Field(..., ge=2024, description="Card expiry year")
    cvv: str = Field(..., min_length=3, max_length=4, description="CVV code")

    class Config:
        json_schema_extra = {
            "example": {
                "card_number": "4111111111111111",
                "expiry_month": 12,
                "expiry_year": 2025,
                "cvv": "123"
            }
        }


class PaymentResponse(BaseModel):
    """Response after payment processing."""
    booking_id: str
    pnr: Optional[str] = None  # Only set on success
    status: str
    payment_status: str  # SUCCESS or FAILED
    final_price: float
    message: str


# Booking Details
class BookingFlightInfo(BaseModel):
    """Embedded flight info in booking response."""
    flight_number: str
    airline: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime


class BookingResponse(BaseModel):
    """Complete booking details."""
    id: str
    pnr: Optional[str] = None
    user_id: str
    flight_id: str
    seat_no: str
    passenger_name: Optional[str] = None
    passenger_email: Optional[str] = None
    final_price: Optional[float] = None
    status: str
    booking_date: Optional[datetime] = None
    created_at: datetime
    flight: Optional[BookingFlightInfo] = None

    class Config:
        from_attributes = True


class BookingHistoryResponse(BaseModel):
    """Response for user's booking history."""
    bookings: List[BookingResponse]
    total_count: int


# Cancellation
class CancellationResponse(BaseModel):
    """Response after booking cancellation."""
    booking_id: str
    pnr: Optional[str] = None
    status: str
    message: str
    refund_amount: Optional[float] = None
