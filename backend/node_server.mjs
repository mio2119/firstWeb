import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dataRoot = path.join(projectRoot, 'public', 'data');
const runtimeRoot = path.join(projectRoot, 'backend', 'runtime');
const stateFile = process.env.BACKEND_STATE_FILE
  ? path.resolve(process.env.BACKEND_STATE_FILE)
  : path.join(runtimeRoot, 'demo_state.json');
const host = process.env.BACKEND_HOST || '127.0.0.1';
const port = Number(process.env.BACKEND_PORT || 8000);

const defaultState = {
  profile: {
    name: '未命名学习者',
    avatar: 'SE',
    province: '',
    score: 0,
    targetCity: '',
    interestTags: [],
    completeness: 0,
    intro_seen: false,
  },
  mbti: null,
  favorites: [],
  history: [],
  plans: [],
};

const jsonCache = new Map();

const sendJson = (res, status, data) => {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  });
  res.end(body);
};

const readBody = (req) => new Promise((resolve, reject) => {
  let raw = '';
  req.on('data', (chunk) => {
    raw += chunk.toString();
  });
  req.on('end', () => {
    if (!raw.trim()) {
      resolve({});
      return;
    }
    try {
      resolve(JSON.parse(raw));
    } catch (error) {
      reject(error);
    }
  });
});

const safeDataPath = (relativePath) => {
  if (!relativePath.endsWith('.json')) {
    throw Object.assign(new Error('Invalid data path'), { status: 400 });
  }
  const target = path.resolve(dataRoot, relativePath);
  if (!target.startsWith(dataRoot)) {
    throw Object.assign(new Error('Invalid data path'), { status: 400 });
  }
  return target;
};

const readJson = async (relativePath) => {
  if (jsonCache.has(relativePath)) return jsonCache.get(relativePath);
  const target = safeDataPath(relativePath);
  try {
    const raw = await fs.readFile(target, 'utf8');
    const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''));
    jsonCache.set(relativePath, parsed);
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw Object.assign(new Error('Data file not found'), { status: 404 });
    }
    throw error;
  }
};

const readState = async () => {
  try {
    const raw = await fs.readFile(stateFile, 'utf8');
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
};

const writeState = async (state) => {
  await fs.mkdir(runtimeRoot, { recursive: true });
  await fs.writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  return state;
};

const replacePlans = async (items) => {
  const state = await readState();
  state.plans = (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
    addedDate: item.addedDate || new Date().toISOString().slice(0, 10),
  }));
  return writeState(state);
};

const listUniversities = async (searchParams) => {
  const items = await readJson('admissions/index_universities.json');
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const province = searchParams.get('province');
  const tag = searchParams.get('tag');
  const results = items.filter((item) => {
    const textOk = !q || String(item.name || '').toLowerCase().includes(q) || String(item.name_cn || '').includes(q);
    const provinceOk = !province || item.province === province;
    const tagOk = !tag || (item.tags || []).some((value) => String(value).includes(tag));
    return textOk && provinceOk && tagOk;
  });
  return { total: results.length, items: results };
};

const getUniversity = async (id) => {
  const items = await readJson('admissions/index_universities.json');
  const item = items.find((entry) => entry.id === id);
  if (!item) throw Object.assign(new Error('University not found'), { status: 404 });
  let detail = null;
  if (item.provinceCode) {
    try {
      const provinceData = await readJson(`provinces/${item.provinceCode}/universities.json`);
      const scoresData = await readJson(`provinces/${item.provinceCode}/scores.json`);
      const entry = provinceData.universities?.find((value) => value.id === id);
      if (entry) {
        detail = { ...entry, historyScores: scoresData.scores?.[id] || entry.historyScores || [] };
      }
    } catch {
      detail = null;
    }
  }
  return { item, detail };
};

const listCareers = async (searchParams) => {
  const items = await readJson('explore/careers_index.json');
  const synonyms = await readJson('explore/synonyms.json');
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const terms = new Set(q ? [q] : []);
  if (q) {
    Object.entries(synonyms).forEach(([key, values]) => {
      const normalizedKey = key.toLowerCase();
      const list = Array.isArray(values) ? values : [];
      if (q.includes(normalizedKey)) list.forEach((value) => terms.add(String(value).toLowerCase()));
      if (list.some((value) => q.includes(String(value).toLowerCase()))) terms.add(normalizedKey);
    });
  }
  const results = items.filter((item) => {
    const haystack = [item.title, item.shortDesc, item.category, ...(item.tags || [])].join(' ').toLowerCase();
    const queryOk = terms.size === 0 || [...terms].some((term) => haystack.includes(term));
    const categoryOk = !category || item.category === category;
    const tagOk = !tag || (item.tags || []).includes(tag);
    return queryOk && categoryOk && tagOk;
  });
  return { total: results.length, items: results };
};

const getCareer = async (id) => {
  try {
    return await readJson(`explore/careers_detail/${id}.json`);
  } catch {
    throw Object.assign(new Error('Career detail not found'), { status: 404 });
  }
};

const normalizeText = (text) => text.trim().toLowerCase().replace(/\s+/g, ' ');

const applySynonyms = (text, synonyms) => {
  let output = text;
  Object.entries(synonyms)
    .sort((a, b) => b[0].length - a[0].length)
    .forEach(([key, value]) => {
      output = output.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), String(value));
    });
  return output;
};

const slotMaps = {
  uni: {
    uni_pku: '北京大学',
    uni_thu: '清华大学',
    uni_fdu: '复旦大学',
    uni_sysu: '中山大学',
    uni_scut: '华南理工大学',
    uni_szu: '深圳大学',
  },
  major: {
    major_cs: '计算机科学与技术',
    major_law: '法学',
    major_finance: '金融学',
    major_med: '临床医学',
    major_ai: '人工智能',
  },
  career: {
    career_pm: 'AI 产品经理',
    career_data: '数据分析师',
    career_doctor: '临床医生',
    career_lawyer: '非诉律师',
    career_design: '数字媒体艺术家',
    career_ops: '产品运营',
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
    province_hi: '海南',
  },
};

const findMappedSlot = (text, map) => {
  const lower = text.toLowerCase();
  for (const [token, value] of Object.entries(map)) {
    if (lower.includes(token.toLowerCase()) || text.includes(value)) return value;
  }
  return null;
};

const extractSlots = (text, context = {}) => {
  const slots = { ...context };
  const score = text.match(/(\d{3})/);
  if (score) {
    const value = Number(score[1]);
    if (value >= 100 && value <= 750) slots.score = String(value);
  }
  const year = text.match(/(20\d{2})/);
  if (year) slots.year = year[1];
  const mbti = text.match(/\b([ei][ns][tf][jp])\b/i);
  if (mbti) slots.mbti = mbti[1].toUpperCase();

  const uni = findMappedSlot(text, slotMaps.uni);
  if (uni) slots.uni = uni;
  const major = findMappedSlot(text, slotMaps.major);
  if (major) slots.major = major;
  const career = findMappedSlot(text, slotMaps.career);
  if (career) slots.career = career;
  const province = findMappedSlot(text, slotMaps.province);
  if (province) slots.province = province;

  return slots;
};

const hydrateText = (text, slots) => text.replace(/\{(\w+)\}/g, (_, key) => slots[key] || '未提供');

const hydrateBlocks = (blocks, slots) => blocks.map((block) => {
  const next = { ...block };
  if (['title', 'text', 'disclaimer'].includes(next.type) && typeof next.content === 'string') {
    next.content = hydrateText(next.content, slots);
  }
  if (next.type === 'list' && Array.isArray(next.items)) {
    next.items = next.items.map((item) => hydrateText(String(item), slots));
  }
  if (next.type === 'cta') {
    if (typeof next.label === 'string') next.label = hydrateText(next.label, slots);
    if (typeof next.description === 'string') next.description = hydrateText(next.description, slots);
    if (next.action?.params) {
      next.action = {
        ...next.action,
        params: Object.fromEntries(Object.entries(next.action.params).map(([key, value]) => [key, hydrateText(String(value), slots)])),
      };
    }
  }
  return next;
});

const chat = async (body) => {
  const synonyms = await readJson('meta/synonyms.json');
  const intents = await readJson('qa/intents.json');
  const templates = await readJson('qa/templates.json');
  const cleaned = normalizeText(body.text || '');
  const replaced = applySynonyms(cleaned, synonyms);
  const slots = extractSlots(replaced, body.context || {});
  let bestIntent = null;
  let bestScore = 0;

  intents.forEach((intent) => {
    if ((intent.negative || []).some((rule) => new RegExp(rule, 'i').test(replaced))) return;
    let score = 0;
    (intent.keywords || []).forEach((keyword) => {
      if (replaced.includes(String(keyword).toLowerCase())) score += 8;
    });
    (intent.regex || []).forEach((rule) => {
      if (new RegExp(rule, 'i').test(replaced)) score += 12;
    });
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  let templateGroup = bestIntent?.templateGroup || 'fallback';
  for (const slot of bestIntent?.requiredSlots || []) {
    if (!slots[slot]) {
      templateGroup = bestIntent.slotPrompts?.[slot] || `slot_${slot}`;
      break;
    }
  }

  const variants = templates[templateGroup]?.variants || templates.fallback?.variants || [];
  const variant = variants[Math.floor(Math.random() * variants.length)] || {
    blocks: [{ type: 'text', content: '我已经收到你的问题，但当前问答模板尚未配置。' }],
    quickReplies: [],
  };

  return {
    blocks: hydrateBlocks(variant.blocks || [], slots),
    quickReplies: variant.quickReplies || [],
    slots,
    intentId: bestIntent?.id || 'fallback',
    templateGroup,
    normalizedText: replaced,
    source: 'node-rule-engine',
  };
};

const submitQuiz = async (body) => {
  const questions = await readJson('quiz/mbti_questions.json');
  const mapping = await readJson('quiz/mapping.json');
  const letters = { EI: ['E', 'I'], SN: ['S', 'N'], TF: ['T', 'F'], JP: ['J', 'P'] };
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  Object.entries(body.answers || {}).forEach(([rawId, rawValue]) => {
    const question = questions.find((item) => String(item.id) === String(rawId));
    const value = Number(rawValue);
    if (!question || !scores[question.dimension]) return;
    if (value < 1 || value > 5) throw Object.assign(new Error('Answer value must be between 1 and 5'), { status: 422 });
    const base = value - 3;
    scores[question.dimension] += question.reverse ? -base : base;
  });
  const type = Object.entries(scores).map(([dimension, score]) => (score >= 0 ? letters[dimension][0] : letters[dimension][1])).join('');
  return { type, scores, mapping: mapping[type] || null };
};

const route = async (req, url) => {
  const pathname = decodeURIComponent(url.pathname);
  if (req.method === 'GET' && pathname === '/api/health') {
    return { ok: true, app: 'Smart Enroll Node Backend', mode: 'zero-dependency-workbench', dataRootExists: true };
  }
  if (req.method === 'GET' && pathname === '/api/workbench') {
    return {
      stage: 'fullstack-workbench',
      frontendStyle: 'preserved',
      dataStrategy: 'reuse public/data first, migrate to database later',
      runtime: 'node-zero-dependency',
    };
  }
  if (req.method === 'GET' && pathname.startsWith('/api/data/')) {
    return readJson(pathname.slice('/api/data/'.length));
  }
  if (req.method === 'GET' && pathname === '/api/universities') return listUniversities(url.searchParams);
  if (req.method === 'GET' && pathname.startsWith('/api/universities/')) return getUniversity(pathname.split('/').pop());
  if (req.method === 'GET' && pathname === '/api/careers') return listCareers(url.searchParams);
  if (req.method === 'GET' && pathname.startsWith('/api/careers/')) return getCareer(pathname.split('/').pop());
  if (req.method === 'GET' && pathname === '/api/quiz/questions') {
    const items = await readJson('quiz/mbti_questions.json');
    return { total: items.length, items };
  }
  if (req.method === 'GET' && pathname.startsWith('/api/quiz/mapping/')) {
    const mapping = await readJson('quiz/mapping.json');
    const type = pathname.split('/').pop().toUpperCase();
    if (!mapping[type]) throw Object.assign(new Error('MBTI mapping not found'), { status: 404 });
    return mapping[type];
  }
  if (req.method === 'POST' && pathname === '/api/quiz/submit') return submitQuiz(await readBody(req));
  if (req.method === 'POST' && pathname === '/api/qa/chat') return chat(await readBody(req));
  if (req.method === 'GET' && pathname === '/api/state') return readState();
  if (req.method === 'PUT' && pathname === '/api/state') return writeState(await readBody(req));
  if (req.method === 'DELETE' && pathname === '/api/state') return writeState(structuredClone(defaultState));
  if (req.method === 'PUT' && pathname === '/api/state/profile') {
    const state = await readState();
    state.profile = await readBody(req);
    return writeState(state);
  }
  if (req.method === 'PUT' && pathname === '/api/state/mbti') {
    const state = await readState();
    state.mbti = await readBody(req);
    return writeState(state);
  }
  if (req.method === 'POST' && pathname === '/api/state/favorites') {
    const state = await readState();
    const item = await readBody(req);
    const payload = item.payload || item;
    state.favorites = [{ id: item.id || payload.id, ...payload }, ...state.favorites.filter((entry) => entry.id !== (item.id || payload.id))];
    return writeState(state);
  }
  if (req.method === 'PUT' && pathname === '/api/state/favorites') {
    const state = await readState();
    const items = await readBody(req);
    state.favorites = Array.isArray(items) ? items : [];
    return writeState(state);
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/state/favorites/')) {
    const state = await readState();
    const itemId = pathname.split('/').pop();
    state.favorites = state.favorites.filter((entry) => entry.id !== itemId);
    return writeState(state);
  }
  if (req.method === 'POST' && pathname === '/api/state/history') {
    const state = await readState();
    const item = await readBody(req);
    const payload = item.payload || item;
    const id = item.id || payload.id || crypto.randomUUID();
    state.history = [{ id, ...payload }, ...state.history.filter((entry) => entry.id !== id)].slice(0, 50);
    return writeState(state);
  }
  if (req.method === 'PUT' && pathname === '/api/state/history') {
    const state = await readState();
    const items = await readBody(req);
    state.history = (Array.isArray(items) ? items : []).slice(0, 50);
    return writeState(state);
  }
  if (req.method === 'DELETE' && pathname === '/api/state/history') {
    const state = await readState();
    state.history = [];
    return writeState(state);
  }
  if (req.method === 'GET' && pathname === '/api/plans') return { items: (await readState()).plans };
  if (req.method === 'PUT' && pathname === '/api/plans') return replacePlans(await readBody(req));
  if (req.method === 'POST' && pathname === '/api/plans') {
    const state = await readState();
    const item = await readBody(req);
    if (state.plans.some((entry) => entry.uniId === item.uniId)) {
      throw Object.assign(new Error('University already exists in plan'), { status: 409 });
    }
    state.plans.push({
      ...item,
      id: item.id || crypto.randomUUID(),
      addedDate: item.addedDate || new Date().toISOString().slice(0, 10),
    });
    return writeState(state);
  }
  if (req.method === 'DELETE' && pathname.startsWith('/api/plans/')) {
    const state = await readState();
    const uniId = pathname.split('/').pop();
    state.plans = state.plans.filter((entry) => entry.uniId !== uniId);
    return writeState(state);
  }
  throw Object.assign(new Error('Not found'), { status: 404 });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const data = await route(req, url);
    sendJson(res, 200, data);
  } catch (error) {
    sendJson(res, error.status || 500, { detail: error.message || 'Internal server error' });
  }
});

server.listen(port, host, () => {
  console.log(`Smart Enroll API listening on http://${host}:${port}`);
});
