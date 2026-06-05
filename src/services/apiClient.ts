import type { PlanItem, UniversityIndexItem } from '../data/types/admissions';
import type { CareerDetail, CareerIndexItem } from '../data/types/explore';
import type { MBTIMappingItem, MBTIQuestion } from '../data/types/quiz';
import type { TemplateBlock } from '../data/types/qa';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const buildUrl = (path: string, params?: Record<string, string | number | undefined | null>) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return `${API_BASE_URL}${normalizedPath}${query ? `?${query}` : ''}`;
};

export interface ApiState<TProfile = unknown, TMbti = unknown, TFavorite = unknown, THistory = unknown> {
  profile: TProfile;
  mbti: TMbti | null;
  favorites: TFavorite[];
  history: THistory[];
  plans: PlanItem[];
}

export interface ChatResponse {
  blocks: TemplateBlock[];
  quickReplies: string[];
  slots: Record<string, string>;
  intentId: string;
  templateGroup: string;
  normalizedText: string;
  source?: string;
}

export interface QuizSubmitResponse {
  type: string;
  scores: Record<string, number>;
  mapping: MBTIMappingItem | null;
}

const request = async <T,>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | undefined | null> }
): Promise<T> => {
  const { params, ...requestOptions } = options || {};
  const response = await fetch(buildUrl(path, params), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(requestOptions.headers || {})
    },
    ...requestOptions
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

export const apiClient = {
  health: () => request<{ ok: boolean; app: string }>('/health'),
  workbench: () => request<Record<string, unknown>>('/workbench'),

  getData: <T,>(relativePath: string) => {
    const cleanPath = relativePath.replace(/^\/+/, '').replace(/^data\//, '');
    return request<T>(`/data/${cleanPath}`);
  },

  getUniversities: (params?: { q?: string; province?: string; tag?: string }) =>
    request<{ total: number; items: UniversityIndexItem[] }>('/universities', { params }),

  getUniversity: (id: string) => request<{ item: UniversityIndexItem; detail: unknown | null }>(`/universities/${id}`),

  getCareers: (params?: { q?: string; category?: string; tag?: string }) =>
    request<{ total: number; items: CareerIndexItem[] }>('/careers', { params }),

  getCareer: (id: string) => request<CareerDetail>(`/careers/${id}`),

  getQuizQuestions: () => request<{ total: number; items: MBTIQuestion[] }>('/quiz/questions'),
  submitQuiz: (answers: Record<number, number>) =>
    request<QuizSubmitResponse>('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    }),

  chat: (text: string, context: Record<string, string>) =>
    request<ChatResponse>('/qa/chat', {
      method: 'POST',
      body: JSON.stringify({ text, context })
    }),

  getState: <TProfile = unknown, TMbti = unknown, TFavorite = unknown, THistory = unknown>() =>
    request<ApiState<TProfile, TMbti, TFavorite, THistory>>('/state'),
  replaceState: (state: Partial<ApiState>) =>
    request<ApiState>('/state', {
      method: 'PUT',
      body: JSON.stringify(state)
    }),
  resetState: () =>
    request<ApiState>('/state', {
      method: 'DELETE'
    }),
  updateProfile: <TProfile,>(profile: TProfile) =>
    request<ApiState<TProfile>>('/state/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),
  updateMbti: <TMbti,>(mbti: TMbti | null) =>
    request<ApiState<unknown, TMbti>>('/state/mbti', {
      method: 'PUT',
      body: JSON.stringify(mbti)
    }),
  replaceFavorites: <TFavorite,>(favorites: TFavorite[]) =>
    request<ApiState<unknown, unknown, TFavorite>>('/state/favorites', {
      method: 'PUT',
      body: JSON.stringify(favorites)
    }),
  addFavorite: <TFavorite extends { id: string },>(item: TFavorite) =>
    request<ApiState<unknown, unknown, TFavorite>>('/state/favorites', {
      method: 'POST',
      body: JSON.stringify({ id: item.id, payload: item })
    }),
  removeFavorite: (id: string) =>
    request<ApiState>(`/state/favorites/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),
  replaceHistory: <THistory,>(history: THistory[]) =>
    request<ApiState<unknown, unknown, unknown, THistory>>('/state/history', {
      method: 'PUT',
      body: JSON.stringify(history)
    }),
  addHistory: <THistory extends { id: string },>(item: THistory) =>
    request<ApiState<unknown, unknown, unknown, THistory>>('/state/history', {
      method: 'POST',
      body: JSON.stringify({ id: item.id, payload: item })
    }),
  clearHistory: () =>
    request<ApiState>('/state/history', {
      method: 'DELETE'
    }),
  getPlans: () => request<{ items: PlanItem[] }>('/plans'),
  replacePlans: (items: PlanItem[]) =>
    request<ApiState>('/plans', {
      method: 'PUT',
      body: JSON.stringify(items)
    }),
  addPlan: (item: PlanItem) =>
    request<ApiState>('/plans', {
      method: 'POST',
      body: JSON.stringify(item)
    }),
  removePlan: (uniId: string) =>
    request<ApiState>(`/plans/${encodeURIComponent(uniId)}`, {
      method: 'DELETE'
    })
};
