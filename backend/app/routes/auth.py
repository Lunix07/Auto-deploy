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

from authlib.integrations.starlette_client import OAuth
from fastapi import Request
from bson import ObjectId
from urllib.parse import urlencode

from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from app.config import CLIENT_ID, CLIENT_SECRET

oauth = OAuth()
oauth.register(
    name='github',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'read:user user:email'}
)

   
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


@router.get("/github-login")
async def github_login(request: Request):
    redirect_uri = request.url_for('github_callback')
    return await oauth.github.authorize_redirect(
        request,
        redirect_uri,
        prompt="login"  # 👈 Forces GitHub to prompt again
    )



@router.get("/github/callback")
async def github_callback(request: Request):
    token = await oauth.github.authorize_access_token(request)
    github_token = token["access_token"]

    resp = await oauth.github.get("user", token=token)
    github_user = resp.json()

    print("GitHub User:", github_user)

    # Get email
    email = github_user.get("email")
    if not email:
        emails_resp = await oauth.github.get("user/emails", token=token)
        emails = emails_resp.json()
        email = next((e["email"] for e in emails if e["primary"]), None)

    if not email:
        raise HTTPException(status_code=400, detail="Unable to get email from GitHub")

    # Check DB
    existing_user = await db.users.find_one({"email": email})

    if not existing_user:
        new_user = {
            "username": github_user.get("login"),
            "email": email,
            "github_id": github_user.get("id"),
            "created_via": "github"
        }
        result = await db.users.insert_one(new_user)
        user_id = result.inserted_id
    else:
        user_id = existing_user["_id"]

    # Create JWT
    token_data = {
        "user_id": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    jwt_token = jwt.encode(token_data, JWT_SECRET, algorithm="HS256")

    # ✅ Redirect to frontend with JWT + GitHub token as query parameters
    query_params = urlencode({
        "access_token": jwt_token,
        "github_token": github_token
    })
    redirect_url = f"http://localhost:5173/oauth-success?{query_params}"
    return RedirectResponse(redirect_url)




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