"""
Seed data utility for populating the database with sample flights.
Run this to initialize the database with test data.
"""

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database.models import Flight, User


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Sample data
AIRLINES = [
    "IndiGo", "Air India", "SpiceJet", "Vistara", "GoAir", "AirAsia India"
]

CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", 
    "Hyderabad", "Ahmedabad", "Pune", "Jaipur", "Lucknow"
]

FLIGHT_PREFIXES = {
    "IndiGo": "6E",
    "Air India": "AI",
    "SpiceJet": "SG",
    "Vistara": "UK",
    "GoAir": "G8",
    "AirAsia India": "I5"
}


def generate_flight_number(airline: str, index: int) -> str:
    """Generate a flight number based on airline and index."""
    prefix = FLIGHT_PREFIXES.get(airline, "XX")
    return f"{prefix}{100 + index}"


def create_admin_user(db: Session) -> None:
    """
    Create a default admin user if not exists.
    
    Credentials:
    - Email: admin@skybook.com
    - Password: admin123
    """
    admin_email = "admin@skybook.com"
    
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        # Make sure they're an admin
        if not existing_admin.is_admin:
            existing_admin.is_admin = 1
            db.commit()
            print(f"✅ Updated {admin_email} to admin status.")
        return
    
    # Create admin user
    admin_user = User(
        name="Admin User",
        email=admin_email,
        password_hash=pwd_context.hash("admin123"),
        is_admin=1
    )
    db.add(admin_user)
    db.commit()
    print(f"✅ Created admin user: {admin_email} / admin123")


def generate_sample_flights(db: Session, num_flights: int = 50) -> list:
    """
    Generate sample flights for testing.
    
    Args:
        db: Database session
        num_flights: Number of flights to generate
    
    Returns:
        List of created Flight objects
    """
    # First, ensure admin user exists
    create_admin_user(db)
    
    flights = []
    
    # Check if flights already exist
    existing_count = db.query(Flight).count()
    if existing_count > 0:
        print(f"Database already has {existing_count} flights. Skipping seed.")
        return []
    
    for i in range(num_flights):
        # Random source and destination (different cities)
        source = random.choice(CITIES)
        destination = random.choice([c for c in CITIES if c != source])
        
        # Random airline
        airline = random.choice(AIRLINES)
        
        # Random departure time in the next 30 days
        days_ahead = random.randint(1, 30)
        hours = random.randint(6, 22)  # Flights between 6 AM and 10 PM
        minutes = random.choice([0, 15, 30, 45])
        departure = datetime.now().replace(
            hour=hours, minute=minutes, second=0, microsecond=0
        ) + timedelta(days=days_ahead)
        
        # Flight duration: 1-4 hours
        duration_hours = random.uniform(1, 4)
        arrival = departure + timedelta(hours=duration_hours)
        
        # Base price: ₹2000 - ₹15000
        base_price = random.randint(2000, 15000)
        
        # Total seats: 150-200
        total_seats = random.choice([150, 160, 170, 180, 190, 200])
        
        # Available seats: 50-100% of total
        available_seats = random.randint(int(total_seats * 0.5), total_seats)
        
        # Initial demand factor: 0.9 - 1.1
        demand_factor = round(random.uniform(0.9, 1.1), 2)
        
        flight = Flight(
            flight_number=generate_flight_number(airline, i),
            airline=airline,
            source=source,
            destination=destination,
            departure_time=departure,
            arrival_time=arrival,
            base_price=base_price,
            total_seats=total_seats,
            available_seats=available_seats,
            demand_factor=demand_factor
        )
        
        db.add(flight)
        flights.append(flight)
    
    db.commit()
    print(f"Successfully created {len(flights)} sample flights.")
    return flights


def clear_all_data(db: Session) -> None:
    """Clear all data from the database (use with caution!)."""
    from app.database.models import Booking, FareHistory, User
    
    db.query(Booking).delete()
    db.query(FareHistory).delete()
    db.query(Flight).delete()
    db.query(User).delete()
    db.commit()
    print("All data cleared from database.")

