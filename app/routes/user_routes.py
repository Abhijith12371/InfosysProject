"""
User Routes - API endpoints for user management and authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import User
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, 
    TokenResponse, MessageResponse
)
from app.services import user_service
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - **name**: User's full name (2-100 characters)
    - **email**: Valid email address (unique)
    - **mobile_no**: Optional mobile number
    - **password**: Password (minimum 6 characters)
    
    Returns access token and user details on success.
    """
    # Create user
    user = user_service.create_user(db, user_data)
    
    # Auto-login after signup
    return user_service.authenticate_user(db, user_data.email, user_data.password)


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    Returns JWT access token valid for 24 hours.
    """
    return user_service.authenticate_user(db, credentials.email, credentials.password)


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout the current user.
    
    Note: Since we use stateless JWT tokens, logout is handled client-side
    by discarding the token. This endpoint confirms logout intent.
    """
    return MessageResponse(message="Logged out successfully")


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile.
    
    Requires authentication via Bearer token.
    """
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        mobile_no=current_user.mobile_no,
        is_admin=current_user.is_admin or 0,
        created_at=current_user.created_at
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Alias for /profile - Get current user's information."""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        mobile_no=current_user.mobile_no,
        is_admin=current_user.is_admin or 0,
        created_at=current_user.created_at
    )
