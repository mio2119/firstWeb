import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from backend.app.core.paths import DATA_ROOT


def _safe_path(relative_path: str) -> Path:
    target = (DATA_ROOT / relative_path).resolve()
    data_root = DATA_ROOT.resolve()
    try:
        target.relative_to(data_root)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid data path") from exc
    if not str(relative_path).endswith(".json"):
        raise HTTPException(status_code=400, detail="Invalid data path")
    return target


@lru_cache(maxsize=128)
def read_json(relative_path: str) -> Any:
    path = _safe_path(relative_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Data file not found")
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid JSON data: {relative_path}") from exc


def get_universities() -> List[Dict[str, Any]]:
    data = read_json("admissions/index_universities.json")
    return data if isinstance(data, list) else []


def get_careers() -> List[Dict[str, Any]]:
    data = read_json("explore/careers_index.json")
    return data if isinstance(data, list) else []


def get_career_detail(career_id: str) -> Optional[Dict[str, Any]]:
    try:
        detail = read_json(f"explore/careers_detail/{career_id}.json")
    except HTTPException as exc:
        if exc.status_code == 404:
            return None
        raise
    return detail if isinstance(detail, dict) else None


def get_university_detail(university: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    province_code = university.get("provinceCode")
    if not province_code:
        return None

    try:
        province_data = read_json(f"provinces/{province_code}/universities.json")
    except HTTPException as exc:
        if exc.status_code == 404:
            return None
        raise

    entries = province_data.get("universities", []) if isinstance(province_data, dict) else []
    detail = next((item for item in entries if item.get("id") == university.get("id")), None)
    if not detail:
        return None

    try:
        scores_data = read_json(f"provinces/{province_code}/scores.json")
    except HTTPException as exc:
        if exc.status_code == 404:
            scores_data = {}
        else:
            raise

    scores = scores_data.get("scores", {}) if isinstance(scores_data, dict) else {}
    return {**detail, "historyScores": scores.get(university.get("id"), detail.get("historyScores", []))}


def get_quiz_questions() -> List[Dict[str, Any]]:
    data = read_json("quiz/mbti_questions.json")
    return data if isinstance(data, list) else []


def get_mbti_mapping() -> Dict[str, Any]:
    data = read_json("quiz/mapping.json")
    return data if isinstance(data, dict) else {}


def get_qa_data() -> Dict[str, Any]:
    synonyms = read_json("meta/synonyms.json")
    intents = read_json("qa/intents.json")
    templates = read_json("qa/templates.json")
    return {
        "synonyms": synonyms if isinstance(synonyms, dict) else {},
        "intents": intents if isinstance(intents, list) else [],
        "templates": templates if isinstance(templates, dict) else {},
    }
