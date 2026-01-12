from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_database
from app.models.registration import RegistrationInDB, RegistrationBase, RegistrationCreate
from app.deps import get_current_user
from app.models.user import UserInDB
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.get("/")
async def read_registrations(current_user: UserInDB = Depends(get_current_user)):
    db = await get_database()
    
    print(f"DEBUG: Fetching registrations for user {current_user.email} (ID: {current_user.id}, Role: {current_user.role})")

    # Filter: Creator OR Team Member
    if current_user.role in ['student', 'coordinator', 'super_coordinator']:
        # Try finding strictly by string first
        try:
             user_oid = ObjectId(current_user.id)
        except:
             user_oid = str(current_user.id)

        query = {
            "$or": [
                {"creator": current_user.id},
                {"creator": user_oid}, # Handle if creator stored as ObjectId
                {"teamMembers": current_user.id},
                {"teamMembers": user_oid},
                {"invitationStatus.userId": current_user.id},
                {"invitationStatus.userId": user_oid}
            ]
        }
        print(f"DEBUG: Query: {query}")
        registrations = await db.registrations.find(query).to_list(1000)
    else:
        registrations = await db.registrations.find().to_list(1000)

    print(f"DEBUG: Found {len(registrations)} registrations")

    # Populate Event and User details
    for reg in registrations:
        # Populate Event
        if "event" in reg:
            try:
                event_id = ObjectId(reg["event"])
                event = await db.events.find_one({"_id": event_id})
                if event:
                    reg["event"] = {"_id": str(event["_id"]), "name": event["name"], "fee": event["fee"], "feePerPerson": event.get("feePerPerson"), "groupSizeMin": event.get("groupSizeMin"), "groupSizeMax": event.get("groupSizeMax"), "startDate": event.get("startDate")}
                else:
                    print(f"DEBUG: Event not found for ID {reg['event']}")
            except Exception as e:
                print(f"DEBUG: Error populating event: {e}")
        
        # Populate Creator
        if "creator" in reg:
             try:
                 creator = await db.users.find_one({"_id": ObjectId(reg["creator"])})
                 if creator:
                     reg["creator"] = {"_id": str(creator["_id"]), "name": creator["name"], "email": creator["email"]}
             except Exception:
                 pass

        # Populate Team Members
        if "teamMembers" in reg:
            try:
                # Handle mixed types in DB (str or ObjectId)
                member_ids = []
                for uid in reg["teamMembers"]:
                    if uid:
                        try:
                             member_ids.append(ObjectId(uid))
                        except:
                             pass
                
                members = await db.users.find({"_id": {"$in": member_ids}}).to_list(None)
                reg["teamMembers"] = [{"_id": str(m["_id"]), "name": m["name"], "email": m["email"]} for m in members]
            except Exception as e:
                print(f"DEBUG: Error populating team: {e}")

        # Populate Invitation User Details
        if "invitationStatus" in reg:
            for inv in reg["invitationStatus"]:
                if "userId" in inv:
                    try:
                        u = await db.users.find_one({"_id": ObjectId(inv["userId"])})
                        if u:
                            inv["userId"] = {"_id": str(u["_id"]), "name": u["name"], "email": u["email"]}
                    except:
                        pass

    return [RegistrationInDB(**reg) for reg in registrations]

@router.post("/", response_model=RegistrationInDB)
async def create_registration(registration: RegistrationCreate, current_user: UserInDB = Depends(get_current_user)):
    db = await get_database()
    
    # 1. Fetch Event & Validate
    event = await db.events.find_one({"_id": ObjectId(registration.event)})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if not event.get("registrationsOpen", True):
        raise HTTPException(status_code=400, detail="Registrations for this event are currently closed.")
    
    # 2. Resolve Emails to User IDs
    team_member_ids = []
    invitations = []
    
    # Add creator first
    team_member_ids.append(current_user.id)
    invitations.append({
        "userId": current_user.id,
        "status": "accepted",
        "token": None,
        "tokenExpires": None
    })
    
    # Process team emails
    for email in registration.teamEmails:
        if email == current_user.email: 
            continue # Skip self
            
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=400, detail=f"User with email {email} not found. They must register first.")
        
        uid = user["_id"]
        if uid not in team_member_ids:
            team_member_ids.append(uid)
            # DIRECT ACCEPT - No Invitations
            invitations.append({
                "userId": uid,
                "status": "accepted", 
                "token": None,
                "tokenExpires": None
            })

    # 3. Create Registration Document
    # Check if event is free
    is_free = event.get("fee", 0) == 0
    
    reg_dict = {
        "event": registration.event,
        "creator": current_user.id,
        "teamMembers": team_member_ids,
        "invitationStatus": invitations,
        "paymentStatus": "paid" if is_free else "pending",
        "paymentId": "FREE" if is_free else None
    }

    result = await db.registrations.insert_one(reg_dict)
    created_reg = await db.registrations.find_one({"_id": result.inserted_id})
    return RegistrationInDB(**created_reg)

class InvitationAction(BaseModel):
    registrationId: str
    action: str


@router.post("/accept")
async def accept_invitation(payload: InvitationAction, current_user: UserInDB = Depends(get_current_user)):
    db = await get_database()
    print(f"DEBUG: Processing invitation action {payload.action} for reg {payload.registrationId} by user {current_user.id}")

    try:
        user_oid = ObjectId(current_user.id)
    except:
        user_oid = str(current_user.id)

    # Try matching with ObjectId first, then String if needed (or $or logic if find_one first)
    # Since we need to update a specific element, we need to know WHICH one matches.
    # But update_one with specific filter is easiest.
    
    # Try updating where userId is ObjectId
    result = await db.registrations.update_one(
        {"_id": ObjectId(payload.registrationId), "invitationStatus.userId": user_oid},
        {"$set": {"invitationStatus.$.status": "accepted" if payload.action == 'accept' else 'declined'}}
    )
    
    if result.modified_count == 0:
         print("DEBUG: No document modified with ObjectId, trying String ID")
         # Try String ID
         result = await db.registrations.update_one(
            {"_id": ObjectId(payload.registrationId), "invitationStatus.userId": current_user.id},
            {"$set": {"invitationStatus.$.status": "accepted" if payload.action == 'accept' else 'declined'}}
        )
    
    print(f"DEBUG: Update result: {result.modified_count}")
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registration or Invitation not found")

    return {"success": True}

@router.delete("/{registration_id}")
async def delete_registration(registration_id: str, current_user: UserInDB = Depends(get_current_user)):
    db = await get_database()
    # Check ownership
    reg = await db.registrations.find_one({"_id": ObjectId(registration_id)})
    if not reg:
        raise HTTPException(status_code=404, detail="Not found")
        
    # Allow if creator or if self is leaving (logic can be complex, simplified here)
    print(f"DEBUG: Deleting registration {registration_id} requested by {current_user.email}")
    
    # Allow if creator or if self is leaving
    if str(reg['creator']) == str(current_user.id):
        print("DEBUG: User is creator, deleting entire registration")
        result = await db.registrations.delete_one({"_id": ObjectId(registration_id)})
        print(f"DEBUG: Delete result: {result.deleted_count}")
    else:
        print("DEBUG: User is team member, removing from team")
        # Remove self from teamMembers and invitationStatus
        result = await db.registrations.update_one(
            {"_id": ObjectId(registration_id)},
            {
                "$pull": {
                    "teamMembers": current_user.id,
                    "invitationStatus": {"userId": current_user.id}
                }
            }
        )
        print(f"DEBUG: Update result: {result.modified_count}")
        
    return {"success": True}
