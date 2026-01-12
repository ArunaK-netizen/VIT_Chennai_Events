
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "technovit_events")

async def promote_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Connecting to {MONGO_URL}, DB: {DB_NAME}")
    
    # Update all users to super_coordinator
    result = await db.users.update_many(
        {},
        {"$set": {"role": "super_coordinator"}}
    )
    
    print(f"Matched {result.matched_count} users.")
    print(f"Modified {result.modified_count} users to 'super_coordinator'.")
    
    # print all users email and role
    users = await db.users.find({}, {"email": 1, "role": 1}).to_list(None)
    for u in users:
        print(f"User: {u.get('email')} - Role: {u.get('role')}")

if __name__ == "__main__":
    asyncio.run(promote_users())
