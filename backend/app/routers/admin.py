from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_database
from app.deps import get_current_user
from app.models.user import UserInDB
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])

# Dependency to check if user is admin
async def get_current_admin(current_user: UserInDB = Depends(get_current_user)):
    # In a real app, check for 'admin' role or specific permissions.
    # For now, we'll assume a specific email or role check.
    # checking if role is 'admin' or 'super_coordinator' or 'coordinator'
    if current_user.role not in ['admin', 'super_coordinator', 'coordinator']:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

from bson import ObjectId

@router.get("/stats")
async def get_admin_stats(admin: UserInDB = Depends(get_current_admin)):
    db = await get_database()
    
    match_stage = {}
    
    # If coordinator, filter registrations by events they are assigned to
    if admin.role == 'coordinator':
         user_id = str(admin.id)
         # Find all event IDs where this user is a coordinator
         coord_events = await db.events.find({
             "$or": [
                 {"studentCoordinators._id": user_id},
                 {"facultyCoordinators._id": user_id}
             ]
         }, {"_id": 1}).to_list(None)
         
         event_ids = [e["_id"] for e in coord_events]
         
         # Convert to strings if stored as strings in registrations, or ObjectIds if stored as ObjectIds
         # Assuming registrations store event as ObjectId usually
         
         match_stage = {"event": {"$in": event_ids}}

    total_registrations = await db.registrations.count_documents(match_stage)
    
    paid_query = match_stage.copy()
    paid_query["paymentStatus"] = "paid"
    paid_count = await db.registrations.count_documents(paid_query)
    
    unpaid_query = match_stage.copy()
    unpaid_query["paymentStatus"] = "pending"
    unpaid_count = await db.registrations.count_documents(unpaid_query)
    
    # Calculate Total Revenue accurately
    # Fetch all paid registrations and their event fees
    pipeline = [
        {"$match": paid_query},
        {"$lookup": {
            "from": "events",
            "localField": "event",
            "foreignField": "_id",
            "as": "eventData"
        }},
        {"$unwind": "$eventData"},
        {"$project": {
            "fee": "$eventData.fee",
        }},
        {"$group": {
            "_id": None,
            "totalRevenue": {"$sum": "$fee"}
        }}
    ]
    
    revenue_result = await db.registrations.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["totalRevenue"] if revenue_result else 0
    
    return {
        "success": True,
        "data": {
            "totalRevenue": total_revenue,
            "totalRegistrations": total_registrations,
            "paidCount": paid_count,
            "unpaidCount": unpaid_count
        }
    }

@router.get("/events")
async def get_admin_events(admin: UserInDB = Depends(get_current_admin)):
    db = await get_database()
    
    query = {}
    if admin.role == 'coordinator':
         # Assuming 'admin' dependency returns the current user model which has _id or id
         # Coordinator info stored in events as 'studentCoordinators' or 'facultyCoordinators' list of objects with _id
         user_id = str(admin.id)
         query = {
             "$or": [
                 {"studentCoordinators._id": user_id},
                 {"facultyCoordinators._id": user_id}
             ]
         }
         
    events = await db.events.find(query).to_list(100)
    
    enriched_events = []
    for event in events:
        event_id = event["_id"]
        
        # Counts
        reg_count = await db.registrations.count_documents({"event": event_id})
        paid_count = await db.registrations.count_documents({"event": event_id, "paymentStatus": "paid"})
        
        # Calculate Revenue for this event
        revenue = paid_count * event.get("fee", 0)
        
        # Demographic Stats (VITians vs Non-VITians)
        # 1. Get all registrations for this event
        regs = await db.registrations.find({"event": event_id}, {"teamMembers": 1}).to_list(None)
        
        all_user_ids = []
        for r in regs:
            # teamMembers is a list of ObjectIds (or strings)
            all_user_ids.extend(r.get("teamMembers", []))
            
        # 2. Fetch users and count
        # Ensure IDs are ObjectIds for query
        valid_oids = []
        for uid in all_user_ids:
            try:
                valid_oids.append(ObjectId(uid))
            except:
                pass
                
        if valid_oids:
            vitians_count = await db.users.count_documents({"_id": {"$in": valid_oids}, "isVITian": True})
            non_vitians_count = await db.users.count_documents({"_id": {"$in": valid_oids}, "isVITian": {"$ne": True}})
        else:
            vitians_count = 0
            non_vitians_count = 0
            
        event_data = {
            "_id": str(event["_id"]),
            "name": event["name"],
            "registered": reg_count,
            "paid": paid_count,
            "unpaid": reg_count - paid_count,
            "amountCollected": revenue,
            "vitians": vitians_count,
            "nonVitians": non_vitians_count
        }
        enriched_events.append(event_data)
    
    # Sort by Revenue desc
    enriched_events.sort(key=lambda x: x['amountCollected'], reverse=True)
        
    return {
        "success": True,
        "data": enriched_events
    }

@router.get("/events/{event_id}/participants")
async def get_event_participants(event_id: str, admin: UserInDB = Depends(get_current_admin)):
    db = await get_database()
    
    # Verify event exists
    try:
        ev_oid = ObjectId(event_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    event = await db.events.find_one({"_id": ev_oid})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Get registrations
    registrations = await db.registrations.find({"event": ev_oid}).to_list(None)
    
    participants = []
    
    for reg in registrations:
        # For each registration, fetch all team members
        member_ids = reg.get("teamMembers", [])
        valid_oids = [ObjectId(uid) for uid in member_ids if ObjectId.is_valid(uid)]
        
        members = await db.users.find({"_id": {"$in": valid_oids}}).to_list(None)
        
        for member in members:
            participants.append({
                "registrationId": str(reg["_id"]),
                "paymentStatus": reg.get("paymentStatus", "pending"),
                "userId": str(member["_id"]),
                "name": member.get("name", "N/A"),
                "email": member.get("email", "N/A"),
                "regNo": member.get("regNo", "N/A"), # Assuming regNo exists
                "phone": member.get("phone", "N/A"),
                "isVITian": member.get("isVITian", False)
            })
            
    return {
        "success": True,
        "event": {
            "name": event["name"],
            "_id": str(event["_id"])
        },
        "data": participants
    }
