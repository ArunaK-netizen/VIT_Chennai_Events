from pydantic import BaseModel, Field
from typing import Optional

class MerchItemBase(BaseModel):
    name: str
    price: float
    image: Optional[str] = None
    salesOpen: bool = True

class MerchItemInDB(MerchItemBase):
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        populate_by_name = True
