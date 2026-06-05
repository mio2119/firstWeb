from typing import Dict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.services.json_repository import get_mbti_mapping, get_quiz_questions


router = APIRouter(prefix="/quiz", tags=["quiz"])


DIMENSION_LETTERS = {
    "EI": ("E", "I"),
    "SN": ("S", "N"),
    "TF": ("T", "F"),
    "JP": ("J", "P"),
}


class QuizSubmitRequest(BaseModel):
    answers: Dict[int, int] = Field(default_factory=dict)


@router.get("/questions")
def questions() -> dict:
    items = get_quiz_questions()
    return {"total": len(items), "items": items}


@router.get("/mapping/{mbti_type}")
def mapping(mbti_type: str) -> dict:
    mapping_data = get_mbti_mapping()
    result = mapping_data.get(mbti_type.upper())
    if not result:
        raise HTTPException(status_code=404, detail="MBTI mapping not found")
    return result


@router.post("/submit")
def submit_quiz(payload: QuizSubmitRequest) -> dict:
    questions_data = get_quiz_questions()
    scores = {"EI": 0, "SN": 0, "TF": 0, "JP": 0}

    for question in questions_data:
        question_id = question.get("id")
        value = payload.answers.get(int(question_id)) if question_id is not None else None
        dimension = question.get("dimension")
        if value is None or dimension not in scores:
            continue
        if value < 1 or value > 5:
            raise HTTPException(status_code=422, detail="Answer value must be between 1 and 5")
        base = int(value) - 3
        scores[dimension] += -base if question.get("reverse") else base

    mbti_type = "".join(
        DIMENSION_LETTERS[dimension][0] if score >= 0 else DIMENSION_LETTERS[dimension][1]
        for dimension, score in scores.items()
    )
    return {
        "type": mbti_type,
        "scores": scores,
        "mapping": get_mbti_mapping().get(mbti_type),
    }
