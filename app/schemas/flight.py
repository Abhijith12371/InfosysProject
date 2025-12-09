"""
Pydantic schemas for Flight-related request and response models.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FlightSearchRequest(BaseModel):
    """Schema for flight search query parameters."""
    source: Optional[str] = Field(None, description="Departure city/airport")
    destination: Optional[str] = Field(None, description="Arrival city/airport")
    departure_date: Optional[str] = Field(None, description="Departure date (YYYY-MM-DD)")
    min_price: Optional[float] = Field(None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(None, ge=0, description="Maximum price filter")


class FlightResponse(BaseModel):
    """Schema for flight data in responses (includes dynamic pricing)."""
    id: str
    flight_number: str
    airline: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    base_price: float
    dynamic_price: float  # Calculated price after applying factors
    total_seats: int
    available_seats: int
    duration_minutes: int  # Calculated field

    class Config:
        from_attributes = True


class FlightListResponse(BaseModel):
    """Schema for list of flights response."""
    flights: List[FlightResponse]
    total_count: int


class SeatInfo(BaseModel):
    """Schema for seat information."""
    seat_no: str
    is_available: bool
    seat_type: str  # WINDOW, MIDDLE, AISLE


class FlightDetailResponse(BaseModel):
    """Schema for detailed flight information including seats."""
    id: str
    flight_number: str
    airline: str
    source: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    base_price: float
    dynamic_price: float
    total_seats: int
    available_seats: int
    available_seat_list: List[str]  # List of available seat numbers

    class Config:
        from_attributes = True


class FareHistoryItem(BaseModel):
    """Schema for fare history record."""
    price: float
    demand_factor: float
    available_seats: int
    recorded_at: datetime

    class Config:
        from_attributes = True


class FareHistoryResponse(BaseModel):
    """Schema for fare history response."""
    flight_id: str
    flight_number: str
    history: List[FareHistoryItem]
