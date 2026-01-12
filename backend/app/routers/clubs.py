from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_database
from app.models.club import ClubInDB, ClubBase
from app.deps import get_current_user
from app.models.user import UserInDB, UserRole

router = APIRouter(prefix="/clubs", tags=["clubs"])

@router.get("/", response_model=List[ClubInDB])
async def read_clubs():
    db = await get_database()
    clubs = await db.clubs.find().to_list(1000)
    return [ClubInDB(**club) for club in clubs]

@router.post("/", response_model=ClubInDB)
async def create_club(club: ClubBase, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    result = await db.clubs.insert_one(club.model_dump())
    created_club = await db.clubs.find_one({"_id": result.inserted_id})
    return ClubInDB(**created_club)

@router.put("/{club_id}", response_model=ClubInDB)
async def update_club(club_id: str, club_update: ClubBase, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    from bson import ObjectId
    
    update_data = {k: v for k, v in club_update.model_dump().items() if v is not None}
    
    result = await db.clubs.update_one(
        {"_id": ObjectId(club_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Club not found")
        
    updated_club = await db.clubs.find_one({"_id": ObjectId(club_id)})
    return ClubInDB(**updated_club)

@router.delete("/{club_id}")
async def delete_club(club_id: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.SUPER_COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = await get_database()
    from bson import ObjectId
    
    result = await db.clubs.delete_one({"_id": ObjectId(club_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Club not found")
        
    return {"message": "Club deleted successfully"}
