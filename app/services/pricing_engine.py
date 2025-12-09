"""
Dynamic Pricing Engine for the Flight Booking App.

Calculates dynamic prices based on:
- Remaining seat percentage
- Time until departure
- Simulated demand level
- Base fare
"""

from datetime import datetime
from app.database.models import Flight


def calculate_seat_factor(flight: Flight) -> float:
    """
    Calculate price factor based on seat availability.
    
    Pricing tiers:
    - >80% available: 1.0 (base price)
    - 50-80% available: 1.2
    - 20-50% available: 1.5
    - <20% available: 2.0
    
    Returns:
        Seat factor multiplier (1.0 - 2.0)
    """
    if flight.total_seats == 0:
        return 1.0
    
    availability_percentage = (flight.available_seats / flight.total_seats) * 100
    
    if availability_percentage > 80:
        return 1.0
    elif availability_percentage > 50:
        return 1.2
    elif availability_percentage > 20:
        return 1.5
    else:
        return 2.0


def calculate_time_factor(flight: Flight) -> float:
    """
    Calculate price factor based on time until departure.
    
    Pricing tiers:
    - >7 days: 1.0
    - 3-7 days: 1.2
    - 1-3 days: 1.3
    - <24 hours: 1.5
    
    Returns:
        Time factor multiplier (1.0 - 1.5)
    """
    now = datetime.now()
    time_until_departure = flight.departure_time - now
    days_until = time_until_departure.days
    hours_until = time_until_departure.total_seconds() / 3600
    
    if days_until > 7:
        return 1.0
    elif days_until >= 3:
        return 1.2
    elif days_until >= 1:
        return 1.3
    elif hours_until > 0:
        return 1.5
    else:
        # Flight has departed
        return 1.0


def calculate_dynamic_price(flight: Flight) -> float:
    """
    Calculate the final dynamic price for a flight.
    
    Formula: base_price * seat_factor * time_factor * demand_factor
    
    Args:
        flight: Flight object with pricing data
    
    Returns:
        Dynamic price rounded to 2 decimal places
    """
    seat_factor = calculate_seat_factor(flight)
    time_factor = calculate_time_factor(flight)
    demand_factor = flight.demand_factor  # From simulated demand engine
    
    dynamic_price = flight.base_price * seat_factor * time_factor * demand_factor
    
    return round(dynamic_price, 2)


def get_pricing_breakdown(flight: Flight) -> dict:
    """
    Get detailed breakdown of price calculation.
    Useful for transparency and debugging.
    
    Returns:
        Dictionary with all pricing factors and final price
    """
    seat_factor = calculate_seat_factor(flight)
    time_factor = calculate_time_factor(flight)
    demand_factor = flight.demand_factor
    
    return {
        "base_price": flight.base_price,
        "seat_factor": seat_factor,
        "time_factor": time_factor,
        "demand_factor": demand_factor,
        "final_price": calculate_dynamic_price(flight),
        "factors_applied": {
            "seats_available": flight.available_seats,
            "total_seats": flight.total_seats,
            "availability_percentage": round((flight.available_seats / flight.total_seats) * 100, 1) if flight.total_seats > 0 else 0,
            "departure_time": flight.departure_time.isoformat()
        }
    }
