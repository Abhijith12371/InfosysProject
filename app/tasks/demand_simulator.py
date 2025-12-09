"""
Demand Simulator - Background task to simulate real-world demand fluctuations.

This task runs periodically to adjust demand factors for flights,
simulating real-world price changes based on demand.
"""

import random
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.database.models import Flight, FareHistory
from app.services.pricing_engine import calculate_dynamic_price


async def simulate_demand_changes():
    """
    Background task that simulates demand changes.
    
    Runs continuously and updates flight demand factors periodically.
    - Adjusts demand_factor randomly (±10%)
    - Records price changes in fare_history
    """
    while True:
        try:
            db = SessionLocal()
            update_demand_factors(db)
            db.close()
        except Exception as e:
            print(f"Demand simulator error: {e}")
        
        # Wait 5 minutes before next update
        await asyncio.sleep(300)


def update_demand_factors(db: Session):
    """
    Update demand factors for all flights.
    
    Simulation logic:
    - Flights departing soon get higher demand
    - Random fluctuations of ±10%
    - Demand factor bounds: 0.8 to 1.5
    """
    flights = db.query(Flight).filter(
        Flight.departure_time > datetime.now()
    ).all()
    
    for flight in flights:
        # Calculate time-based demand adjustment
        hours_until_departure = (flight.departure_time - datetime.now()).total_seconds() / 3600
        
        if hours_until_departure < 24:
            # High demand for last-minute flights
            base_adjustment = random.uniform(0.05, 0.15)
        elif hours_until_departure < 72:
            # Moderate demand
            base_adjustment = random.uniform(-0.05, 0.10)
        else:
            # Normal fluctuations
            base_adjustment = random.uniform(-0.10, 0.10)
        
        # Apply adjustment
        new_demand_factor = flight.demand_factor + base_adjustment
        
        # Clamp to valid range
        new_demand_factor = max(0.8, min(1.5, new_demand_factor))
        new_demand_factor = round(new_demand_factor, 2)
        
        # Update only if there's a change
        if abs(new_demand_factor - flight.demand_factor) > 0.01:
            flight.demand_factor = new_demand_factor
            
            # Record in fare history
            history = FareHistory(
                flight_id=flight.id,
                price=calculate_dynamic_price(flight),
                demand_factor=flight.demand_factor,
                available_seats=flight.available_seats
            )
            db.add(history)
    
    db.commit()
    print(f"[Demand Simulator] Updated {len(flights)} flights at {datetime.now()}")


def run_single_update():
    """
    Run a single demand update (for testing or manual triggers).
    """
    db = SessionLocal()
    try:
        update_demand_factors(db)
    finally:
        db.close()
