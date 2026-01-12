from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.config import get_settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.db.mongodb import get_database
from app.models.user import UserCreate, UserInDB
from app.schemas.token import Token
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

@router.post("/signup", response_model=UserInDB)
async def signup(user: UserCreate):
    db = await get_database()
    user_exists = await db.users.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    
    # Auto-detect VITian
    if user.email.endswith('@vitstudent.ac.in'):
        user_dict["isVITian"] = True
    else:
        user_dict["isVITian"] = False
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return UserInDB(**created_user)

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = await get_database()
    user = await db.users.find_one({"email": form_data.username}) # OAuth2 form sends email as username
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from google.oauth2 import id_token
from google.auth.transport import requests

class GoogleLogin(BaseModel):
    token: str

@router.post("/google", response_model=Token)
async def google_login(login_data: GoogleLogin):
    try:
        # Verify the token using Google's libraries
        # settings.GOOGLE_CLIENT_ID comes from .env
        try:
             idinfo = id_token.verify_oauth2_token(login_data.token, requests.Request(), settings.GOOGLE_CLIENT_ID)
             email = idinfo['email']
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid Google Token")

        db = await get_database()
        user = await db.users.find_one({"email": email})
        
        if not user:
            # Create user
            user_dict = {
                "email": email,
                "name": idinfo.get('name', 'Google User'),
                "password": get_password_hash("google_auth_random_pass"), # Random password
                "role": "student",
                "authProvider": "google",
                "authProvider": "google",
                "isVITian": email.endswith("@vitstudent.ac.in") if email else False
            }
            db.users.insert_one(user_dict)
            
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")
