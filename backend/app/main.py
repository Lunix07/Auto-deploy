from fastapi import FastAPI
from app.routes.auth import router as auth_router  # ⬅️ Correct import
from fastapi.middleware.cors import CORSMiddleware
from app.routes.projects import router as projects_router
import os
from starlette.middleware.sessions import SessionMiddleware
from app.routes import deploy
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ⬅️ This leads to your React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "supersecret"))

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(deploy.router)
