from fastapi import APIRouter

from backend.app.services.json_repository import read_json


router = APIRouter(prefix="/data", tags=["data"])


@router.get("/{relative_path:path}")
def get_data(relative_path: str):
    return read_json(relative_path)
