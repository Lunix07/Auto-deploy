
from fastapi import APIRouter
import importlib
import pkgutil
from pathlib import Path

router = APIRouter()

# Dynamically include all routers in the routes folder
package_dir = Path(__file__).resolve().parent
for (_, module_name, _) in pkgutil.iter_modules([str(package_dir)]):
    module = importlib.import_module(f"app.routes.{module_name}")
    if hasattr(module, "router"):
        router.include_router(module.router)
