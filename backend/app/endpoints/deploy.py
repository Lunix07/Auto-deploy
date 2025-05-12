from fastapi import HTTPException
from app.models import DeployRequest
from app.services import GithubService

def deploy_app(request: DeployRequest):
    github_service = GithubService()

    try:
        new_repo_name = github_service.create_repo_from_template(request.app_name, request.username)
        print(f"New repo created: {new_repo_name}")  
        github_service.wait_for_workflow(new_repo_name, "import_user_repo.yml")
        github_service.trigger_import_workflow(new_repo_name, request.user_repo_url,"import_user_repo.yml")
        github_service.create_github_webhook(request.user_repo_url, request.username,new_repo_name)


        return {
            "status": "success",
            "repo_name": new_repo_name
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
