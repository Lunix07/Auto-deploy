from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/projects", tags=["Projects"])
client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client.websiteDB

JWT_SECRET = os.getenv("JWT_SECRET")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Decode JWT and extract user_id
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ Include token in the Pydantic model
class ProjectCreate(BaseModel):
    title: str
    github_url: str
    token: str  # <-- GitHub token from the form

# ✅ Store all 3 fields (title, github_url, token)
@router.post("/")
async def create_project(request: Request, user_id: str = Depends(get_current_user)):
    body = await request.json()
    print("📥 Project request body:", body)  # ✅ Add this
    print("🔑 Authenticated user ID:", user_id)  # ✅ Add this

    title = body.get("title")
    github_url = body.get("github_url")
    token = body.get("token")

    if not title or not github_url or not token:
        raise HTTPException(status_code=400, detail="Missing required fields")

    project = {
        "user_id": user_id,
        "title": title,
        "github_url": github_url,
        "token": token,
    }

    result = await db.projects.insert_one(project)
    print("✅ Project inserted with ID:", result.inserted_id)  # ✅ Add this
    return {"id": str(result.inserted_id), "message": "Project created"}
# ✅ Return user projects
@router.get("/")
async def get_user_projects(user_id: str = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user_id}).to_list(100)
    for project in projects:
        project["_id"] = str(project["_id"])
    return {"projects": projects}
