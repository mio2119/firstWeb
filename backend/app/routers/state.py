import uuid
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.state_store import read_state, update_section, write_state


router = APIRouter(tags=["state"])


class GenericItem(BaseModel):
    id: str
    payload: Dict[str, Any]


class PlanItem(BaseModel):
    id: Optional[str] = None
    uniId: str
    universityName: str
    logo_char: str = ""
    majorName: Optional[str] = None
    strategyType: str
    addedDate: Optional[str] = None


@router.get("/state")
def get_state() -> dict:
    return read_state()


@router.put("/state")
def replace_state(state: Dict[str, Any]) -> dict:
    return write_state(state)


@router.delete("/state")
def reset_state() -> dict:
    return write_state({})


@router.put("/state/profile")
def update_profile(profile: Dict[str, Any]) -> dict:
    return update_section("profile", profile)


@router.put("/state/mbti")
def update_mbti(mbti: Any) -> dict:
    return update_section("mbti", mbti)


@router.post("/state/favorites")
def add_favorite(item: GenericItem) -> dict:
    state = read_state()
    favorites = [entry for entry in state["favorites"] if entry.get("id") != item.id]
    favorites.insert(0, {"id": item.id, **item.payload})
    state["favorites"] = favorites
    return write_state(state)


@router.put("/state/favorites")
def replace_favorites(items: List[Dict[str, Any]]) -> dict:
    return update_section("favorites", items)


@router.delete("/state/favorites/{item_id}")
def remove_favorite(item_id: str) -> dict:
    state = read_state()
    state["favorites"] = [entry for entry in state["favorites"] if entry.get("id") != item_id]
    return write_state(state)


@router.post("/state/history")
def add_history(item: GenericItem) -> dict:
    state = read_state()
    history = [entry for entry in state["history"] if entry.get("id") != item.id]
    history.insert(0, {"id": item.id, **item.payload})
    state["history"] = history[:50]
    return write_state(state)


@router.put("/state/history")
def replace_history(items: List[Dict[str, Any]]) -> dict:
    return update_section("history", items[:50])


@router.delete("/state/history")
def clear_history() -> dict:
    return update_section("history", [])


@router.get("/plans")
def get_plans() -> dict:
    return {"items": read_state()["plans"]}


@router.put("/plans")
def replace_plans(items: List[PlanItem]) -> dict:
    state = read_state()
    state["plans"] = [
        {
            **item.model_dump(exclude_none=True),
            "id": item.id or str(uuid.uuid4()),
            "addedDate": item.addedDate or date.today().isoformat(),
        }
        for item in items
    ]
    return write_state(state)


@router.post("/plans")
def add_plan(item: PlanItem) -> dict:
    state = read_state()
    if any(entry.get("uniId") == item.uniId for entry in state["plans"]):
        raise HTTPException(status_code=409, detail="University already exists in plan")
    state["plans"].append(
        {
            **item.model_dump(exclude_none=True),
            "id": item.id or str(uuid.uuid4()),
            "addedDate": item.addedDate or date.today().isoformat(),
        }
    )
    return write_state(state)


@router.delete("/plans/{uni_id}")
def remove_plan(uni_id: str) -> dict:
    state = read_state()
    state["plans"] = [entry for entry in state["plans"] if entry.get("uniId") != uni_id]
    return write_state(state)
