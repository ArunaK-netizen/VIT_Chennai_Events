from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.db.mongodb import get_database
from app.models.event import EventInDB, EventBase
from app.deps import get_current_user
from app.models.user import UserInDB, UserRole
from bson import ObjectId

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/", response_model=List[EventInDB])
async def read_events():
    db = await get_database()
    events = await db.events.find().to_list(1000)
    
    # Populate club names
    for event in events:
        if "clubs" in event and event["clubs"]:
            club_ids = [ObjectId(cid) for cid in event["clubs"] if isinstance(cid, (str, ObjectId))]
            if club_ids:
                clubs = await db.clubs.find({"_id": {"$in": club_ids}}).to_list(len(club_ids))
                # Replace club IDs with club objects (containing name)
                event["clubs"] = [{"_id": str(c["_id"]), "name": c.get("name", "Unknown")} for c in clubs]
    
    return [EventInDB(**event) for event in events]

@router.post("/", response_model=EventInDB)
async def create_event(event: EventBase, current_user: UserInDB = Depends(get_current_user)):
    # Simple check for coordinator role (expand as needed)
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = await get_database()
    result = await db.events.insert_one(event.model_dump())
    created_event = await db.events.find_one({"_id": result.inserted_id})
    return EventInDB(**created_event)

@router.get("/{event_id}", response_model=EventInDB)
async def read_event(event_id: str):
    db = await get_database()
    # Need to handle ObjectId conversion if storing as ObjectId, assuming string for now based on Pydantic models
    # But usually Mongo uses ObjectId. Pydantic models have _id as string alias but input might need conversion.
    # For now, fetching by matching _id string or we need a helper.
    # Motor/Mongo usually needs ObjectId(event_id). 
    # Let's import ObjectId
    from bson import ObjectId
    try:
        oid = ObjectId(event_id)
    except:
         raise HTTPException(status_code=404, detail="Event not found")

    event = await db.events.find_one({"_id": oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Populate clubs
    if "clubs" in event and event["clubs"]:
        club_ids = [ObjectId(cid) for cid in event["clubs"] if isinstance(cid, (str, ObjectId))]
        if club_ids:
            clubs = await db.clubs.find({"_id": {"$in": club_ids}}).to_list(len(club_ids))
            # Replace club IDs with club objects (containing name)
            event["clubs"] = [{"_id": str(c["_id"]), "name": c.get("name", "Unknown")} for c in clubs]

    return EventInDB(**event)

@router.put("/{event_id}", response_model=EventInDB)
async def update_event(event_id: str, event_update: EventBase, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.SUPER_COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = await get_database()
    from bson import ObjectId
    try:
        oid = ObjectId(event_id)
    except:
         raise HTTPException(status_code=404, detail="Event not found")
         
    # If coordinator, check ownership
    if current_user.role == UserRole.COORDINATOR:
        existing_event = await db.events.find_one({"_id": oid})
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
            
        is_assigned = False
        user_id = str(current_user.id)
        
        # Check student coords
        for c in existing_event.get("studentCoordinators", []):
            if c.get("_id") == user_id:
                is_assigned = True
                break
        
        # Check faculty coords if not found yet
        if not is_assigned:
            for c in existing_event.get("facultyCoordinators", []):
                if c.get("_id") == user_id:
                    is_assigned = True
                    break
                    
        if not is_assigned:
             raise HTTPException(status_code=403, detail="Not authorized to edit this event")
         
    # Update
    result = await db.events.update_one(
        {"_id": oid},
        {"$set": event_update.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
        
    updated_event = await db.events.find_one({"_id": oid})
    return EventInDB(**updated_event)

@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_COORDINATOR, UserRole.COORDINATOR]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db = await get_database()
    from bson import ObjectId
    try:
        oid = ObjectId(event_id)
    except:
         raise HTTPException(status_code=404, detail="Event not found")

    # If coordinator, check ownership
    if current_user.role == UserRole.COORDINATOR:
        existing_event = await db.events.find_one({"_id": oid})
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
            
        is_assigned = False
        user_id = str(current_user.id)
        
        # Check student coords
        for c in existing_event.get("studentCoordinators", []):
            if c.get("_id") == user_id:
                is_assigned = True
                break
        
        if not is_assigned:
            for c in existing_event.get("facultyCoordinators", []):
                if c.get("_id") == user_id:
                    is_assigned = True
                    break
                    
        if not is_assigned:
             raise HTTPException(status_code=403, detail="Not authorized to delete this event")
         
    result = await db.events.delete_one({"_id": oid})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
        
    return {"success": True, "message": "Event deleted"}

@router.patch("/{event_id}", response_model=EventInDB)
async def patch_event(event_id: str, updates: Dict[str, Any], current_user: UserInDB = Depends(get_current_user)):
    db = await get_database()
    from bson import ObjectId
    try:
        oid = ObjectId(event_id)
    except:
        raise HTTPException(status_code=404, detail="Event not found")

    # Fetch existing event
    existing_event = await db.events.find_one({"_id": oid})
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # --- RBAC Logic ---
    allowed_keys = set()
    
    # 1. Admin / Super Coordinator: Can Update Everything
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_COORDINATOR]:
        allowed_keys = {"isPinned", "isHidden", "registrationsOpen", "name", "description", "venue", "startDate", "startTime", "endDate", "endTime", "fee", "groupSizeMin", "groupSizeMax"}
    
    # 2. Coordinator: Can Update specifics IF assigned
    elif current_user.role == UserRole.COORDINATOR:
        # Check assignment
        is_assigned = False
        user_id = str(current_user.id)
        
        # Check student coords
        for c in existing_event.get("studentCoordinators", []):
            if c.get("_id") == user_id:
                is_assigned = True
                break
        
        # Check faculty coords
        if not is_assigned:
            for c in existing_event.get("facultyCoordinators", []):
                if c.get("_id") == user_id:
                    is_assigned = True
                    break
        
        if is_assigned:
            # Coordinators can toggle visibility and registrations, but NOT PIN
            allowed_keys = {"isHidden", "registrationsOpen", "name", "description", "venue", "startDate", "startTime", "endDate", "endTime", "fee", "groupSizeMin", "groupSizeMax"}
        else:
            raise HTTPException(status_code=403, detail="Not authorized to edit this event")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Filter updates based on allowed keys
    clean_updates = {k: v for k, v in updates.items() if k in allowed_keys}
    
    # Validation: If User tries to set 'isPinned' but isn't allowed (e.g. Coordinator somehow sends it)
    if "isPinned" in updates and "isPinned" not in allowed_keys:
         raise HTTPException(status_code=403, detail="You are not authorized to Pin events.")

    if not clean_updates:
        raise HTTPException(status_code=400, detail="No valid updates provided")

    # Perform Update
    await db.events.update_one(
        {"_id": oid},
        {"$set": clean_updates}
    )
    
    updated_event = await db.events.find_one({"_id": oid})
    return EventInDB(**updated_event)
