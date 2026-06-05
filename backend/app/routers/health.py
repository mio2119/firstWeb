from fastapi import APIRouter

from backend.app.core.config import settings
from backend.app.core.paths import DATA_ROOT


router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "app": settings.app_name,
        "dataRootExists": DATA_ROOT.exists(),
    }


@router.get("/workbench")
def workbench() -> dict:
    return {
        "stage": "fullstack-workbench",
        "frontendStyle": "preserved",
        "dataStrategy": "reuse public/data first, migrate to database later",
        "nextSteps": [
            "Install backend dependencies",
            "Run FastAPI on port 8000",
            "Switch frontend data modules through src/services/apiClient.ts",
        ],
    }

