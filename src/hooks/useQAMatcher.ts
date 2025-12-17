import { useMemo } from 'react';
import type { Intent, SlotKey, TemplateBlock, TemplateGroup, TemplateVariant } from '../data/types/qa';

type SlotMap = Partial<Record<SlotKey, string>>;
type SynonymMap = Record<string, string>;

interface MatcherInput {
  text: string;
  context: SlotMap;
}

interface MatcherResult {
  blocks: TemplateBlock[];
  quickReplies: string[];
  slots: SlotMap;
  intentId: string;
  templateGroup: string;
  normalizedText: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeText = (text: string) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u3000\r\n\t]/g, ' ')
    .replace(/[，。！？、,.!?]/g, ' ')
    .replace(/\s+/g, ' ');
};

const applySynonyms = (text: string, synonyms: SynonymMap) => {
  let output = text;
  const entries = Object.entries(synonyms).sort((a, b) => b[0].length - a[0].length);
  entries.forEach(([key, value]) => {
    const pattern = new RegExp(escapeRegExp(key), 'gi');
    output = output.replace(pattern, value);
  });
  return output;
};

const resolveSlotValue = (slots: SlotMap, key: string) => {
  return slots[key as SlotKey] || '未提供';
};

const hydrateText = (text: string, slots: SlotMap) => {
  return text.replace(/\{(\w+)\}/g, (_, key) => resolveSlotValue(slots, key));
};

const hydrateBlocks = (blocks: TemplateBlock[], slots: SlotMap) => {
  return blocks.map((block) => {
    if (block.type === 'title' || block.type === 'text' || block.type === 'disclaimer') {
      return { ...block, content: hydrateText(block.content, slots) };
    }
    if (block.type === 'list') {
      return { ...block, items: block.items.map((item) => hydrateText(item, slots)) };
    }
    if (block.type === 'cta') {
      const params = block.action.params
        ? Object.fromEntries(Object.entries(block.action.params).map(([k, v]) => [k, hydrateText(v, slots)]))
        : undefined;
      return {
        ...block,
        label: hydrateText(block.label, slots),
        description: block.description ? hydrateText(block.description, slots) : undefined,
        action: { ...block.action, params }
      };
    }
    return block;
  });
};

const pickVariant = (group?: TemplateGroup): TemplateVariant | null => {
  if (!group || !group.variants || group.variants.length === 0) return null;
  const index = Math.floor(Math.random() * group.variants.length);
  return group.variants[index];
};

const slotMaps = {
  uni: {
    uni_pku: '北京大学',
    uni_thu: '清华大学',
    uni_fdu: '复旦大学',
    uni_sysu: '中山大学',
    uni_scut: '华南理工大学',
    uni_szu: '深圳大学'
  },
  major: {
    major_cs: '计算机科学与技术',
    major_law: '法学',
    major_finance: '金融学',
    major_med: '临床医学',
    major_ai: '人工智能'
  },
  career: {
    career_pm: 'AI 产品经理',
    career_data: '数据分析师',
    career_doctor: '临床医生',
    career_lawyer: '非诉律师',
    career_design: '数字媒体艺术家',
    career_ops: '产品运营'
  },
  province: {
    province_bj: '北京',
    province_sh: '上海',
    province_gd: '广东',
    province_zj: '浙江',
    province_js: '江苏',
    province_hb: '湖北',
    province_sc: '四川',
    province_hn: '湖南',
    province_sd: '山东',
    province_tj: '天津',
    province_cq: '重庆',
    province_sn: '陕西',
    province_fj: '福建',
    province_gx: '广西',
    province_yn: '云南',
    province_ha: '河南',
    province_he: '河北',
    province_jx: '江西',
    province_ah: '安徽',
    province_ln: '辽宁',
    province_jl: '吉林',
    province_hl: '黑龙江',
    province_gs: '甘肃',
    province_sx: '山西',
    province_nm: '内蒙古',
    province_xj: '新疆',
    province_nx: '宁夏',
    province_qh: '青海',
    province_gz: '贵州',
    province_hi: '海南'
  }
};

const provinceNames = Object.values(slotMaps.province);

const findMappedSlot = (text: string, map: Record<string, string>) => {
  for (const [token, value] of Object.entries(map)) {
    if (text.includes(token.toLowerCase()) || text.includes(value)) {
      return value;
    }
  }
  return null;
};

const extractSlots = (text: string, context: SlotMap): SlotMap => {
  const nextSlots: SlotMap = { ...context };

  const scoreMatch = text.match(/(\d{3})/);
  if (scoreMatch) {
    const score = parseInt(scoreMatch[1], 10);
    if (score >= 100 && score <= 750) {
      nextSlots.score = String(score);
    }
  }

  const yearMatch = text.match(/(20\d{2})/);
  if (yearMatch) {
    nextSlots.year = yearMatch[1];
  }

  const mbtiMatch = text.match(/\b([ei][ns][tf][jp])\b/i);
  if (mbtiMatch) {
    nextSlots.mbti = mbtiMatch[1].toUpperCase();
  }

  const uni = findMappedSlot(text, slotMaps.uni);
  if (uni) nextSlots.uni = uni;

  const major = findMappedSlot(text, slotMaps.major);
  if (major) nextSlots.major = major;

  const career = findMappedSlot(text, slotMaps.career);
  if (career) nextSlots.career = career;

  const provinceToken = findMappedSlot(text, slotMaps.province);
  if (provinceToken) {
    nextSlots.province = provinceToken;
  } else {
    const explicitProvince = provinceNames.find((name) => text.includes(name));
    if (explicitProvince) nextSlots.province = explicitProvince;
  }

  return nextSlots;
};

export const useQAMatcher = (
  intents: Intent[],
  templates: Record<string, TemplateGroup>,
  synonyms: SynonymMap
) => {
  const compiledIntents = useMemo(() => {
    return intents.map((intent) => ({
      ...intent,
      regex: (intent.regex || []).map((pattern) => new RegExp(pattern, 'i')),
      negative: (intent.negative || []).map((pattern) => new RegExp(pattern, 'i'))
    }));
  }, [intents]);

  const match = (input: MatcherInput): MatcherResult => {
    const cleaned = normalizeText(input.text);
    const replaced = applySynonyms(cleaned, synonyms);
    const slots = extractSlots(replaced, input.context);

    let bestIntent: Intent | null = null;
    let bestScore = 0;

    compiledIntents.forEach((intent) => {
      if (intent.negative?.some((rule) => rule.test(replaced))) {
        return;
      }

      let score = 0;
      intent.keywords.forEach((kw) => {
        if (replaced.includes(kw.toLowerCase())) score += 8;
      });
      intent.regex?.forEach((rule) => {
        if (rule.test(replaced)) score += 12;
      });

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    });

    const intentId = bestIntent?.id || 'fallback';
    let templateGroup = bestIntent?.templateGroup || 'fallback';

    if (bestIntent) {
      const missingSlot = bestIntent.requiredSlots.find((slot) => !slots[slot]);
      if (missingSlot) {
        templateGroup = bestIntent.slotPrompts?.[missingSlot] || `slot_${missingSlot}`;
      }
    }

    const group = templates[templateGroup] || templates.fallback;
    const variant = pickVariant(group) || pickVariant(templates.fallback);

    if (!variant) {
      return {
        blocks: [],
        quickReplies: [],
        slots,
        intentId,
        templateGroup,
        normalizedText: replaced
      };
    }

    return {
      blocks: hydrateBlocks(variant.blocks, slots),
      quickReplies: variant.quickReplies || [],
      slots,
      intentId,
      templateGroup,
      normalizedText: replaced
    };
  };

  return { match };
};
