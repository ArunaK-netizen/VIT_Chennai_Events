from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated, Any, Union
from datetime import datetime
from enum import Enum

# Helper to map MongoDB ObjectId to str
PyObjectId = Annotated[str, BeforeValidator(str)]

class InvitationStatus(str, Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'

class PaymentStatus(str, Enum):
    PENDING = 'pending'
    PAID = 'paid'

from bson import ObjectId

def mongo_encodable(v: Any) -> Any:
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, dict):
        return v
    return v

MongoEncodable = Annotated[Any, BeforeValidator(mongo_encodable)]

class Invitation(BaseModel):
    userId: Optional[MongoEncodable] = None
    status: InvitationStatus = InvitationStatus.PENDING
    token: Optional[str] = None
    tokenExpires: Optional[datetime] = None

class RegistrationBase(BaseModel):
    event: Optional[MongoEncodable] = None 
    creator: Optional[MongoEncodable] = None 
    teamMembers: List[MongoEncodable] = [] 
    invitationStatus: List[Invitation] = []
    paymentStatus: PaymentStatus = PaymentStatus.PENDING
    paymentId: Optional[str] = None

class RegistrationInDB(RegistrationBase):
    id: Optional[PyObjectId] = Field(None, alias="_id")

    class Config:
        populate_by_name = True

class RegistrationCreate(BaseModel):
    event: PyObjectId
    teamEmails: List[str] = []
