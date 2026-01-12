from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, List, Any, Annotated
from enum import Enum
from datetime import datetime

# Helper to map MongoDB ObjectId to str
PyObjectId = Annotated[str, BeforeValidator(str)]

class UserRole(str, Enum):
    STUDENT = 'student'
    COORDINATOR = 'coordinator'
    SUPER_COORDINATOR = 'super_coordinator'
    REGISTRATION_COORDINATOR = 'registration_coordinator'
    MERCH_COORDINATOR = 'merch_coordinator'
    ADMIN = 'admin'

class AuthProvider(str, Enum):
    CREDENTIALS = 'credentials'
    GOOGLE = 'google'

class School(str, Enum):
    SENSE = 'sense'
    SELECT = 'select'
    SCOPE = 'scope'
    SAS = 'sas'
    SSL = 'ssl'
    SMEC = 'smec'
    VFIT = 'vfit'
    SCE = 'sce'
    VITSOL = 'vitsol'

class UserBase(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    role: UserRole = UserRole.STUDENT
    authProvider: AuthProvider = AuthProvider.CREDENTIALS
    isVITian: bool = False
    registrationNumber: Optional[str] = None
    phoneNumber: Optional[str] = None
    collegeName: Optional[str] = None
    school: Optional[School] = None
    club: Optional[PyObjectId] = None # Object ID as string

class UserCreate(UserBase):
    password: Optional[str] = None

class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    username: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
            }
        }
