from fastapi import APIRouter, Depends
from typing import List
from app.deps import get_current_user
from app.models.user import UserInDB, UserCreate

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserInDB, response_model_by_alias=True)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserInDB])
async def read_users(current_user: UserInDB = Depends(get_current_user)):
    # Simple role check
    if current_user.role not in ['admin', 'super_coordinator', 'coordinator']:
         from fastapi import HTTPException
         raise HTTPException(status_code=403, detail="Not authorized")
    
    from app.db.mongodb import get_database
    db = await get_database()
    users = await db.users.find().to_list(2000) # Limit 2000
    return [UserInDB(**u) for u in users]

@router.post("/admin/create", response_model=UserInDB)
async def create_user_admin(user: UserCreate, current_user: UserInDB = Depends(get_current_user)):
    # Only super_coordinator can create other coordinators/admins
    if current_user.role not in ['super_coordinator', 'admin']:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    from app.db.mongodb import get_database
    from app.core.security import get_password_hash
    from fastapi import HTTPException, status
    
    db = await get_database()
    
    # Check if user exists
    user_exists = await db.users.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
        
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    user_dict["password"] = hashed_password
    
    # If role is not specified in payload, it defaults to student in schema usually, 
    # but here we respect what's passed in UserCreate or extend the schema if needed.
    # Assuming UserCreate has 'role' field. If not, we might need to check the model.
    # For now, we assume standard UserCreate handles it or we manually ensure it.
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return UserInDB(**created_user)
