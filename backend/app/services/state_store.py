import json
from pathlib import Path
from typing import Any, Dict

from backend.app.core.paths import RUNTIME_ROOT


STATE_FILE = RUNTIME_ROOT / "demo_state.json"


DEFAULT_STATE: Dict[str, Any] = {
    "profile": {
        "name": "未命名学习者",
        "avatar": "SE",
        "province": "",
        "score": 0,
        "targetCity": "",
        "interestTags": [],
        "completeness": 0,
        "intro_seen": False,
    },
    "mbti": None,
    "favorites": [],
    "history": [],
    "plans": [],
}


def read_state() -> Dict[str, Any]:
    if not STATE_FILE.exists():
        return json.loads(json.dumps(DEFAULT_STATE, ensure_ascii=False))
    try:
        current = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        current = {}
    merged = json.loads(json.dumps(DEFAULT_STATE, ensure_ascii=False))
    merged.update(current if isinstance(current, dict) else {})
    return merged


def write_state(state: Dict[str, Any]) -> Dict[str, Any]:
    RUNTIME_ROOT.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
    return state


def update_section(section: str, value: Any) -> Dict[str, Any]:
    state = read_state()
    state[section] = value
    return write_state(state)

