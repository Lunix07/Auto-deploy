from fastapi import APIRouter, Request
from app.services.github import GithubService
from app.models import DeployRequest

router = APIRouter()

@router.post("/create")
async def createwebhook(request: DeployRequest):
    github_service = GithubService()
    github_service.create_github_webhook(request.user_repo_url)
    # Handle the incoming webhook payload

@router.post("/webhook/update/{username}/{deployed_repo_name}")
async def handle_update_event(username: str, deployed_repo_name: str, request: Request):
    payload = await request.json()

    # Ignore webhook test events or empty push
    if "hook" in payload or payload.get("head_commit") is None:
        print("⚠️ Ignoring GitHub webhook test or empty push event.")
        return {"status": "Ignored test event"}

    print(f"🔄 Update event received for user: {username}")

    user_repo_url = payload["repository"]["clone_url"]

    # Trigger import workflow
    github_service = GithubService()
    github_service.trigger_import_workflow(deployed_repo_name, user_repo_url,"import_user_repo.yml")

    return {
        "status": "Workflow triggered",
        "app_user": username,
        "source_repo": user_repo_url,
        "target_repo": deployed_repo_name
    }
