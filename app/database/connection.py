"""
Database connection and session management for the Flight Booking App.
Uses SQLAlchemy with SQLite for development.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL - creates file in project root
SQLALCHEMY_DATABASE_URL = "sqlite:///./flight_booking.db"

# Create engine with connection arguments for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session.
    Yields a session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize the database by creating all tables.
    Called on application startup.
    """
    from app.database.models import User, Flight, Booking, FareHistory
    Base.metadata.create_all(bind=engine)
