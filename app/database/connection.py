"""
Database connection and session management for the Flight Booking App.
Uses SQLAlchemy with PostgreSQL on Render.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL database URL on Render (external hostname for outside connections)
SQLALCHEMY_DATABASE_URL = "postgresql://sample_k90q_user:uCR7KRcyZDKNPmftvT1pWSRlAYOWvvx4@dpg-d4pe9a24i8rc73co0q70-a.oregon-postgres.render.com/sample_k90q"

# Create engine for PostgreSQL with SSL required for Render
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"sslmode": "require"}
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
