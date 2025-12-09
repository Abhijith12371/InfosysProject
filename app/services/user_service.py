"""
User Service - Handles user registration, authentication, and profile management.
"""

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.database.models import User
from app.schemas.user import UserCreate, UserResponse, TokenResponse
from app.utils.auth import hash_password, verify_password, create_access_token


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user account.
    
    Args:
        db: Database session
        user_data: User registration data
    
    Returns:
        Created User object
    
    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    user = User(
        name=user_data.name,
        email=user_data.email,
        mobile_no=user_data.mobile_no,
        password_hash=hash_password(user_data.password)
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


def authenticate_user(db: Session, email: str, password: str) -> TokenResponse:
    """
    Authenticate user and return JWT token.
    
    Args:
        db: Database session
        email: User's email
        password: User's password
    
    Returns:
        TokenResponse with access token and user data
    
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            mobile_no=user.mobile_no,
            created_at=user.created_at
        )
    )


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Get user by ID.
    
    Args:
        db: Database session
        user_id: User's ID
    
    Returns:
        User object or None if not found
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Get user by email.
    
    Args:
        db: Database session
        email: User's email
    
    Returns:
        User object or None if not found
    """
    return db.query(User).filter(User.email == email).first()
