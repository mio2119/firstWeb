import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

type CacheEntry = {
  data?: unknown;
  error?: string;
  promise?: Promise<unknown>;
};

const cache = new Map<string, CacheEntry>();

const createErrorMessage = (path: string, reason: string) => {
  return `加载数据失败：${path}（${reason}）`;
};

// 统一处理 GitHub Pages base
const resolvePath = (path: string) => {
  const base = import.meta.env.BASE_URL; // dev: "/"  pages: "/firstWeb/"
  const p = path.replace(/^\/+/, '');    // 去掉开头的 /
  return `${base}${p}`;                 // "/firstWeb/" + "data/xxx.json"
};

const isDataPath = (path: string) => /^\/?data\/.+\.json$/i.test(path);

const fetchStaticJson = (rawPath: string): Promise<unknown> => {
  const path = resolvePath(rawPath);

  return fetch(path)
    .then(async (res) => {
      if (!res.ok) throw new Error(createErrorMessage(path, `HTTP ${res.status}`));
      try {
        return await res.json();
      } catch {
        throw new Error(`数据解析失败：${path}`);
      }
    });
};

const fetchJson = (rawPath: string): Promise<unknown> => {
  const path = resolvePath(rawPath);
  const cacheKey = isDataPath(rawPath) ? `api-first:${rawPath}` : path;

  const cached = cache.get(cacheKey);
  if (cached?.promise) return cached.promise;

  const promise = (isDataPath(rawPath)
    ? apiClient.getData(rawPath).catch(() => fetchStaticJson(rawPath))
    : fetchStaticJson(rawPath))
    .then((data) => {
      cache.set(cacheKey, { data });
      return data;
    })
    .catch((err) => {
      const message = err instanceof Error ? err.message : createErrorMessage(path, '未知错误');
      cache.set(cacheKey, { error: message });
      throw new Error(message);
    });

  cache.set(cacheKey, { promise });
  return promise;
};

export const useData = <T,>(rawPath: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!rawPath) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const path = resolvePath(rawPath);
    const cacheKey = isDataPath(rawPath) ? `api-first:${rawPath}` : path;
    const cached = cache.get(cacheKey);

    if (cached?.data) {
      setData(cached.data as T);
      setError(null);
      setLoading(false);
      return;
    }
    if (cached?.error) {
      setData(null);
      setError(cached.error);
      setLoading(false);
      return;
    }

    setData(null);
    setError(null);
    setLoading(true);

    fetchJson(rawPath)
      .then((result) => {
        if (cancelled) return;
        setData(result as T);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : createErrorMessage(path, '未知错误');
        setData(null);
        setError(message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [rawPath]);

  return { data, loading, error };
};
