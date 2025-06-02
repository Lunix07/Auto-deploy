from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
load_dotenv()
router = APIRouter(
     prefix="/api/auth",
     tags=["Authentication"]
)  

client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client.websiteDB
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed = pwd_context.hash(user.password)
    new_user = {
        "username": user.username,
        "email": user.email,
        "password": hashed
    }

    await db.users.insert_one(new_user)
    return {"msg": "User created successfully"}
@router.get("/ping-db")
async def ping_db():
    try:
        # Try fetching just one user
        user = await db.users.find_one({})
        return {"connected": True, "sample_user": user}
    except Exception as e:
        return {"connected": False, "error": str(e)}


@router.get("/ping-db")
async def ping_db():
    try:
        # Try fetching just one user
        user = await db.users.find_one({})
        return {"connected": True, "sample_user": user}
    except Exception as e:
        return {"connected": False, "error": str(e)}
    



JWT_SECRET = os.getenv("JWT_SECRET")

class LoginInput(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
async def login(user_input: LoginInput):
    print("🔐 Attempting login for:", user_input.email)
    
    user = await db.users.find_one({"email": user_input.email})
    if not user:
        print("❌ Email not found in DB")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print("✅ User found. Verifying password...")
    print("→ Plain:", user_input.password)
    print("→ Hash :", user['password'])

    valid = pwd_context.verify(user_input.password, user["password"])
    print("✅ Password valid:", valid)

    if not valid:
        print("❌ Password mismatch")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate JWT
    token_data = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(token_data, os.getenv("JWT_SECRET"), algorithm="HS256")

    return {
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"]
        }
    }