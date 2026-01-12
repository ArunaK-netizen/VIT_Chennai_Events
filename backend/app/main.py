from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from contextlib import asynccontextmanager
from app.routers import auth, users, events, clubs, registrations, merch, payments, admin

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(events.router)
app.include_router(clubs.router)
app.include_router(registrations.router)
app.include_router(merch.router)
app.include_router(payments.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TechnoVIT API"}
