from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_database
from app.models.merch_item import MerchItemInDB, MerchItemBase
from app.deps import get_current_user
from app.models.user import UserInDB, UserRole

router = APIRouter(prefix="/merch", tags=["merch"])

@router.get("/", response_model=List[MerchItemInDB])
async def read_merch_items():
    db = await get_database()
    items = await db.merch_items.find().to_list(1000)
    return [MerchItemInDB(**item) for item in items]

@router.post("/", response_model=MerchItemInDB)
async def create_merch_item(item: MerchItemBase, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.MERCH_COORDINATOR, UserRole.SUPER_COORDINATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    result = await db.merch_items.insert_one(item.model_dump())
    created_item = await db.merch_items.find_one({"_id": result.inserted_id})
    return MerchItemInDB(**created_item)

@router.put("/{item_id}", response_model=MerchItemInDB)
async def update_merch_item(item_id: str, item_update: MerchItemBase, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.MERCH_COORDINATOR, UserRole.SUPER_COORDINATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = await get_database()
    from bson import ObjectId
    try:
        oid = ObjectId(item_id)
    except:
         raise HTTPException(status_code=404, detail="Item not found")
         
    result = await db.merch_items.update_one(
        {"_id": oid},
        {"$set": item_update.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
        
    updated_item = await db.merch_items.find_one({"_id": oid})
    return MerchItemInDB(**updated_item)

@router.delete("/{item_id}")
async def delete_merch_item(item_id: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_COORDINATOR, UserRole.MERCH_COORDINATOR, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = await get_database()
    from bson import ObjectId
    try:
        oid = ObjectId(item_id)
    except:
         raise HTTPException(status_code=404, detail="Item not found")
         
    result = await db.merch_items.delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return {"success": True, "message": "Item deleted"}
