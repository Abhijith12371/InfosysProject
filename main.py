"""
Flight Booking App Simulator - Main Application Entry Point

A comprehensive FastAPI-based flight booking system with:
- User authentication (JWT)
- Flight search with dynamic pricing
- Multi-step booking flow
- Concurrency-safe seat reservations
- PNR generation
- Booking history and cancellation

Run with: uvicorn main:app --reload
API Documentation: http://localhost:8000/docs
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import init_db, SessionLocal
from app.routes import user_routes, flight_routes, booking_routes
from app.utils.seed_data import generate_sample_flights
from app.tasks.demand_simulator import simulate_demand_changes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Flight Booking App...")
    
    # Initialize database
    init_db()
    print("✅ Database initialized")
    
    # Seed sample data
    db = SessionLocal()
    try:
        generate_sample_flights(db, num_flights=50)
    finally:
        db.close()
    
    # Start background demand simulator (optional)
    # Uncomment to enable automatic demand changes
    # asyncio.create_task(simulate_demand_changes())
    # print("✅ Demand simulator started")
    
    print("✅ Application ready!")
    print("📖 API Documentation: http://localhost:8000/docs")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Flight Booking App...")


# Create FastAPI application
app = FastAPI(
    title="Flight Booking App Simulator",
    description="""
## 🛫 Flight Booking System API

A comprehensive flight booking simulator built with FastAPI.

### Features:
- **User Management**: Registration, login, and profile management
- **Flight Search**: Search flights with filters and dynamic pricing
- **Dynamic Pricing**: Prices adjust based on demand, availability, and time
- **Multi-Step Booking**: Seat selection → Passenger info → Payment
- **Concurrency Control**: Prevents double booking with database locks
- **PNR Generation**: Unique booking confirmation codes

### Booking Flow:
1. `POST /api/bookings/select-seat` - Reserve a seat
2. `POST /api/bookings/{id}/passenger` - Add passenger details
3. `POST /api/bookings/{id}/payment` - Complete payment

### Authentication:
Most endpoints require a Bearer token. Get one via `/api/users/login`.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user_routes.router)
app.include_router(flight_routes.router)
app.include_router(booking_routes.router)


# Root endpoint
@app.get("/", tags=["Health"])
def root():
    """
    Root endpoint - Application health check.
    """
    return {
        "status": "running",
        "application": "Flight Booking App Simulator",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "database": "connected"
    }


# Manual trigger for demand simulation (for testing)
@app.post("/api/admin/simulate-demand", tags=["Admin"])
def trigger_demand_simulation():
    """
    Manually trigger a demand simulation update.
    Useful for testing dynamic pricing changes.
    """
    from app.tasks.demand_simulator import run_single_update
    run_single_update()
    return {"message": "Demand simulation triggered successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
