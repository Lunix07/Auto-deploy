from pydantic import BaseModel

class DeployRequest(BaseModel):
    username: str
    user_repo_url: str
    has_dockerfile: bool
    language: str = None  # Optional if has_dockerfile=True
    app_name: str
    port: int
