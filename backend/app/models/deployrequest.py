from pydantic import BaseModel

class DeployRequest(BaseModel):
    username: str
    user_repo_url: str
    app_name: str
    github_token: str