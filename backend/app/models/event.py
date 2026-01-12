from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Dict, Any, Annotated
from datetime import datetime

# Helper to map MongoDB ObjectId to str
PyObjectId = Annotated[str, BeforeValidator(str)]

class CoordinatorInfo(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    name: Optional[str] = None
    phone: Optional[str] = None

class EventBase(BaseModel):
    name: str
    description: Optional[str] = None
    poster: Optional[str] = None
    clubs: List[Any] = [] # List of Club IDs or Club Objects
    isCollaboration: bool = False
    venue: Optional[str] = None
    startDate: Optional[datetime] = None
    startTime: Optional[str] = None
    endDate: Optional[datetime] = None
    endTime: Optional[str] = None
    fee: float = 0
    feePerPerson: Optional[float] = None
    feeStructure: Optional[Dict[str, float]] = None
    groupSizeMin: int = 1
    groupSizeMax: int = 1
    studentCoordinators: List[CoordinatorInfo] = []
    facultyCoordinators: List[CoordinatorInfo] = []
    registrationsOpen: bool = True
    isHidden: bool = False
    isPinned: bool = False
    pendingChanges: Optional[Dict[str, Any]] = None
    changeRequestedBy: Optional[str] = None
    changeRequestedAt: Optional[datetime] = None

class EventInDB(EventBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
