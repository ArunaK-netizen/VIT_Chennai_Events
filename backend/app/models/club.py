from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, List, Annotated

# Helper to map MongoDB ObjectId to str
PyObjectId = Annotated[str, BeforeValidator(str)]

class Coordinator(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id") # User Schema ID
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class ClubBase(BaseModel):
    name: str
    facultyCoordinators: List[Coordinator] = []
    studentCoordinators: List[Coordinator] = []

class ClubInDB(ClubBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    
    class Config:
        populate_by_name = True
