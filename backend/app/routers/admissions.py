from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from backend.app.services.json_repository import get_universities, get_university_detail


router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("")
def list_universities(
    q: Optional[str] = Query(default=None),
    province: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
) -> dict:
    universities = get_universities()
    query = (q or "").strip().lower()

    def matches(item: dict) -> bool:
        text_ok = True
        if query:
            text_ok = query in str(item.get("name", "")).lower() or query in str(item.get("name_cn", ""))
        province_ok = not province or item.get("province") == province
        tag_ok = not tag or any(tag in str(value) for value in item.get("tags", []))
        return text_ok and province_ok and tag_ok

    results = [item for item in universities if matches(item)]
    return {"total": len(results), "items": results}


@router.get("/{university_id}")
def get_university(university_id: str) -> dict:
    universities = get_universities()
    university = next((item for item in universities if item.get("id") == university_id), None)
    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    return {
        "item": university,
        "detail": get_university_detail(university),
    }

