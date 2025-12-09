"""
PNR (Passenger Name Record) generator utility.
Generates unique 6-character alphanumeric codes for confirmed bookings.
"""

import random
import string
from sqlalchemy.orm import Session

from app.database.models import Booking


def generate_pnr(db: Session) -> str:
    """
    Generate a unique 6-character alphanumeric PNR.
    
    The PNR format is: 6 uppercase letters/digits
    Example: A1B2C3, XYZ789, etc.
    
    Args:
        db: Database session to check for uniqueness
    
    Returns:
        Unique PNR string
    """
    characters = string.ascii_uppercase + string.digits
    max_attempts = 100  # Prevent infinite loop
    
    for _ in range(max_attempts):
        # Generate random 6-character code
        pnr = ''.join(random.choices(characters, k=6))
        
        # Check if PNR already exists
        existing = db.query(Booking).filter(Booking.pnr == pnr).first()
        if not existing:
            return pnr
    
    # Fallback: Use timestamp-based PNR if random generation fails
    import time
    timestamp = str(int(time.time()))[-6:]
    return f"T{timestamp[-5:]}"


def format_pnr(pnr: str) -> str:
    """
    Format PNR for display (e.g., add dashes or spaces).
    Currently returns as-is, but can be customized.
    """
    return pnr.upper()
