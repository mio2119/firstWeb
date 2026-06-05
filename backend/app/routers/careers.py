from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from backend.app.services.json_repository import get_career_detail, get_careers, read_json


router = APIRouter(prefix="/careers", tags=["careers"])


@router.get("")
def list_careers(
    q: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
) -> dict:
    careers = get_careers()
    synonyms = read_json("explore/synonyms.json")
    terms = set()
    if q:
        terms.add(q.strip().lower())
        if isinstance(synonyms, dict):
            for key, values in synonyms.items():
                values = values if isinstance(values, list) else []
                normalized_key = str(key).lower()
                if normalized_key in q.lower():
                    terms.update(str(value).lower() for value in values)
                if any(str(value).lower() in q.lower() for value in values):
                    terms.add(normalized_key)

    def matches(item: dict) -> bool:
        haystack = " ".join(
            [
                str(item.get("title", "")),
                str(item.get("shortDesc", "")),
                str(item.get("category", "")),
                " ".join(str(value) for value in item.get("tags", [])),
            ]
        ).lower()
        query_ok = not terms or any(term in haystack for term in terms)
        category_ok = not category or item.get("category") == category
        tag_ok = not tag or tag in item.get("tags", [])
        return query_ok and category_ok and tag_ok

    results = [item for item in careers if matches(item)]
    return {"total": len(results), "items": results}


@router.get("/{career_id}")
def get_career(career_id: str) -> dict:
    detail = get_career_detail(career_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Career detail not found")
    return detail

