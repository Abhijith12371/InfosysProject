"""
SQLAlchemy ORM models for the Flight Booking App.
Defines User, Flight, Booking, and FareHistory tables with relationships.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum

from app.database.connection import Base


def generate_uuid():
    """Generate a unique UUID string."""
    return str(uuid.uuid4())


class BookingStatus(enum.Enum):
    """Enum for booking status values."""
    PENDING = "PENDING"           # Seat selected, awaiting passenger info
    INFO_ADDED = "INFO_ADDED"     # Passenger info added, awaiting payment
    CONFIRMED = "CONFIRMED"       # Payment successful, booking complete
    CANCELLED = "CANCELLED"       # Booking cancelled
    FAILED = "FAILED"             # Payment failed


class User(Base):
    """
    User model for storing user account information.
    """
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    mobile_no = Column(String(15), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Flight(Base):
    """
    Flight model for storing flight information.
    Includes dynamic pricing factors.
    """
    __tablename__ = "flights"

    id = Column(String, primary_key=True, default=generate_uuid)
    flight_number = Column(String(10), unique=True, nullable=False)
    airline = Column(String(50), nullable=False)
    source = Column(String(50), nullable=False, index=True)
    destination = Column(String(50), nullable=False, index=True)
    departure_time = Column(DateTime, nullable=False, index=True)
    arrival_time = Column(DateTime, nullable=False)
    base_price = Column(Float, nullable=False)
    total_seats = Column(Integer, nullable=False, default=180)
    available_seats = Column(Integer, nullable=False, default=180)
    demand_factor = Column(Float, nullable=False, default=1.0)  # For dynamic pricing

    # Relationships
    bookings = relationship("Booking", back_populates="flight")
    fare_history = relationship("FareHistory", back_populates="flight")

    def __repr__(self):
        return f"<Flight(id={self.id}, {self.source}->{self.destination})>"


class Booking(Base):
    """
    Booking model for storing flight reservations.
    Tracks the multi-step booking flow with status.
    """
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    pnr = Column(String(6), unique=True, nullable=True, index=True)  # Generated after confirmation
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    flight_id = Column(String, ForeignKey("flights.id"), nullable=False)
    seat_no = Column(String(5), nullable=False)  # e.g., "12A", "15B"
    passenger_name = Column(String(100), nullable=True)
    passenger_email = Column(String(100), nullable=True)
    final_price = Column(Float, nullable=True)  # Price at time of booking
    status = Column(String(20), default=BookingStatus.PENDING.value)
    booking_date = Column(DateTime, nullable=True)  # Set on confirmation
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings")
    flight = relationship("Flight", back_populates="bookings")

    def __repr__(self):
        return f"<Booking(id={self.id}, pnr={self.pnr}, status={self.status})>"


class FareHistory(Base):
    """
    FareHistory model for tracking price changes over time.
    Used to analyze pricing trends and for transparency.
    """
    __tablename__ = "fare_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    flight_id = Column(String, ForeignKey("flights.id"), nullable=False)
    price = Column(Float, nullable=False)
    demand_factor = Column(Float, nullable=False)
    available_seats = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    flight = relationship("Flight", back_populates="fare_history")

    def __repr__(self):
        return f"<FareHistory(flight_id={self.flight_id}, price={self.price})>"
