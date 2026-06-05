import random
import re
from typing import Any, Dict, List, Optional, Tuple


SlotMap = Dict[str, str]

SLOT_MAPS: Dict[str, Dict[str, str]] = {
    "uni": {
        "uni_pku": "北京大学",
        "uni_thu": "清华大学",
        "uni_fdu": "复旦大学",
        "uni_sysu": "中山大学",
        "uni_scut": "华南理工大学",
        "uni_szu": "深圳大学",
    },
    "major": {
        "major_cs": "计算机科学与技术",
        "major_law": "法学",
        "major_finance": "金融学",
        "major_med": "临床医学",
        "major_ai": "人工智能",
    },
    "career": {
        "career_pm": "AI 产品经理",
        "career_data": "数据分析师",
        "career_doctor": "临床医生",
        "career_lawyer": "非诉律师",
        "career_design": "数字媒体艺术家",
        "career_ops": "产品运营",
    },
    "province": {
        "province_bj": "北京",
        "province_sh": "上海",
        "province_gd": "广东",
        "province_zj": "浙江",
        "province_js": "江苏",
        "province_hb": "湖北",
        "province_sc": "四川",
        "province_hn": "湖南",
        "province_sd": "山东",
        "province_tj": "天津",
        "province_cq": "重庆",
        "province_sn": "陕西",
        "province_fj": "福建",
        "province_gx": "广西",
        "province_yn": "云南",
        "province_ha": "河南",
        "province_he": "河北",
        "province_jx": "江西",
        "province_ah": "安徽",
        "province_ln": "辽宁",
        "province_jl": "吉林",
        "province_hl": "黑龙江",
        "province_gs": "甘肃",
        "province_sx": "山西",
        "province_nm": "内蒙古",
        "province_xj": "新疆",
        "province_nx": "宁夏",
        "province_qh": "青海",
        "province_gz": "贵州",
        "province_hi": "海南",
    },
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def apply_synonyms(text: str, synonyms: Dict[str, str]) -> str:
    output = text
    for key, value in sorted(synonyms.items(), key=lambda item: len(item[0]), reverse=True):
        output = re.sub(re.escape(key), str(value), output, flags=re.IGNORECASE)
    return output


def find_mapped_slot(text: str, mapping: Dict[str, str]) -> Optional[str]:
    lowered = text.lower()
    for token, value in mapping.items():
        if token.lower() in lowered or value in text:
            return value
    return None


def extract_slots(text: str, context: SlotMap) -> SlotMap:
    slots = dict(context)

    score_match = re.search(r"(\d{3})", text)
    if score_match:
        score = int(score_match.group(1))
        if 100 <= score <= 750:
            slots["score"] = str(score)

    year_match = re.search(r"(20\d{2})", text)
    if year_match:
        slots["year"] = year_match.group(1)

    mbti_match = re.search(r"\b([ei][ns][tf][jp])\b", text, flags=re.IGNORECASE)
    if mbti_match:
        slots["mbti"] = mbti_match.group(1).upper()

    for slot, mapping in SLOT_MAPS.items():
        value = find_mapped_slot(text, mapping)
        if value:
            slots[slot] = value

    return slots


def hydrate_text(text: str, slots: SlotMap) -> str:
    def replace(match: re.Match[str]) -> str:
        return slots.get(match.group(1), "未提供")

    return re.sub(r"\{(\w+)\}", replace, text)


def hydrate_blocks(blocks: List[Dict[str, Any]], slots: SlotMap) -> List[Dict[str, Any]]:
    hydrated: List[Dict[str, Any]] = []
    for block in blocks:
        next_block = dict(block)
        block_type = next_block.get("type")
        if block_type in {"title", "text", "disclaimer"} and isinstance(next_block.get("content"), str):
            next_block["content"] = hydrate_text(next_block["content"], slots)
        elif block_type == "list" and isinstance(next_block.get("items"), list):
            next_block["items"] = [hydrate_text(str(item), slots) for item in next_block["items"]]
        elif block_type == "cta":
            if isinstance(next_block.get("label"), str):
                next_block["label"] = hydrate_text(next_block["label"], slots)
            if isinstance(next_block.get("description"), str):
                next_block["description"] = hydrate_text(next_block["description"], slots)
            action = dict(next_block.get("action", {}))
            params = action.get("params")
            if isinstance(params, dict):
                action["params"] = {key: hydrate_text(str(value), slots) for key, value in params.items()}
            next_block["action"] = action
        hydrated.append(next_block)
    return hydrated


def pick_variant(templates: Dict[str, Any], group_name: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    group = templates.get(group_name) or templates.get("fallback") or {}
    variants = group.get("variants") if isinstance(group, dict) else None
    if not variants:
        return [{"type": "text", "content": "我已经收到你的问题，但当前问答模板尚未配置。"}], []
    variant = random.choice(variants)
    return variant.get("blocks", []), variant.get("quickReplies", [])


def match_chat(text: str, context: SlotMap, qa_data: Dict[str, Any]) -> Dict[str, Any]:
    synonyms = qa_data.get("synonyms", {})
    intents = qa_data.get("intents", [])
    templates = qa_data.get("templates", {})

    cleaned = normalize_text(text)
    replaced = apply_synonyms(cleaned, synonyms if isinstance(synonyms, dict) else {})
    slots = extract_slots(replaced, context)

    best_intent: Dict[str, Any] = {}
    best_score = 0
    for intent in intents:
        if not isinstance(intent, dict):
            continue

        negative_rules = intent.get("negative") or []
        if any(re.search(pattern, replaced, flags=re.IGNORECASE) for pattern in negative_rules):
            continue

        score = 0
        for keyword in intent.get("keywords", []):
            if str(keyword).lower() in replaced:
                score += 8
        for pattern in intent.get("regex", []) or []:
            if re.search(pattern, replaced, flags=re.IGNORECASE):
                score += 12
        if score > best_score:
            best_score = score
            best_intent = intent

    template_group = best_intent.get("templateGroup", "fallback") if best_intent else "fallback"
    required_slots = best_intent.get("requiredSlots", []) if best_intent else []
    for slot in required_slots:
        if slot not in slots:
            slot_prompts = best_intent.get("slotPrompts", {})
            template_group = slot_prompts.get(slot, f"slot_{slot}")
            break

    blocks, quick_replies = pick_variant(templates if isinstance(templates, dict) else {}, template_group)

    return {
        "blocks": hydrate_blocks(blocks, slots),
        "quickReplies": quick_replies,
        "slots": slots,
        "intentId": best_intent.get("id", "fallback") if best_intent else "fallback",
        "templateGroup": template_group,
        "normalizedText": replaced,
        "source": "backend-rule-engine",
    }
