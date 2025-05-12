import os
from dotenv import load_dotenv

load_dotenv()  # load from .env file

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")
TEMPLATE_REPO = os.getenv("TEMPLATE_REPO")
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
