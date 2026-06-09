import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

// --- Types ---

export interface UserProfile {
  name: string;
  avatar: string; // Emoji char or DataURL
  province: string;
  score: number;
  targetCity: string;
  interestTags: string[];
  completeness: number; // 0-100
  intro_seen?: boolean;
}

export interface MBTIResult {
  type: string;
  timestamp: number;
  resultId?: string;
}

export interface FavoriteItem {
  id: string;
  type: 'university' | 'major' | 'career';
  title: string;
  subtitle?: string; // e.g. "Beijing · 985" or "Salary 30k"
  tags?: string[];
  path: string; // URL to navigate
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  type: 'browsing' | 'qa';
  title: string;
  path?: string; // For browsing
  content?: string; // For QA
  timestamp: number;
}

interface UserContextType {
  profile: UserProfile;
  mbti: MBTIResult | null;
  favorites: FavoriteItem[];
  history: HistoryItem[];
  
  // Actions
  updateProfile: (data: Partial<UserProfile>) => void;
  setMBTI: (data: MBTIResult) => void;
  toggleFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => void;
  isFavorite: (id: string) => boolean;
  addToHistory: (item: Omit<HistoryItem, 'timestamp' | 'id'>) => void;
  clearHistory: () => void;
  
  // Data Management
  exportData: () => void;
  importData: (file: File) => Promise<void>;
  resetData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Default Values ---
const DEFAULT_PROFILE: UserProfile = {
  name: "未命名学者",
  avatar: "🖋️",
  province: "",
  score: 0,
  targetCity: "",
  interestTags: [],
  completeness: 0,
  intro_seen: false
};

const readLocalJson = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    return fallback;
  }
};

const syncQuietly = (task: Promise<unknown>) => {
  task.catch((error) => {
    console.warn('Backend state sync skipped:', error);
  });
};

const isBackendDefaultProfile = (value: UserProfile) => {
  const hasNoJourneyData =
    !value.province &&
    !value.targetCity &&
    !value.score &&
    !value.intro_seen &&
    (!value.interestTags || value.interestTags.length === 0);
  const hasDefaultIdentity =
    value.name === DEFAULT_PROFILE.name ||
    value.name === '未命名学习者' ||
    value.avatar === DEFAULT_PROFILE.avatar ||
    value.avatar === 'SE';
  return hasNoJourneyData && hasDefaultIdentity;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization (Lazy Load from LocalStorage)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = readLocalJson<Partial<UserProfile> | null>('sec_user_profile', null);
    // MERGE logic: Ensure we have all default fields even if LS has partial data
    return saved ? { ...DEFAULT_PROFILE, ...saved } : DEFAULT_PROFILE;
  });

  const [mbti, setMbtiState] = useState<MBTIResult | null>(() => {
    return readLocalJson<MBTIResult | null>('sec_mbti_result', null);
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    return readLocalJson<FavoriteItem[]>('sec_favorites', []);
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    return readLocalJson<HistoryItem[]>('sec_history', []);
  });

  useEffect(() => {
    let cancelled = false;

    apiClient.getState<UserProfile, MBTIResult, FavoriteItem, HistoryItem>()
      .then((remoteState) => {
        if (cancelled) return;
        const localProfile = readLocalJson<Partial<UserProfile> | null>('sec_user_profile', null);
        const localMbti = readLocalJson<MBTIResult | null>('sec_mbti_result', null);
        const localFavorites = readLocalJson<FavoriteItem[]>('sec_favorites', []);
        const localHistory = readLocalJson<HistoryItem[]>('sec_history', []);

        if (remoteState.profile && !(localProfile && isBackendDefaultProfile(remoteState.profile))) {
          setProfile({ ...DEFAULT_PROFILE, ...remoteState.profile });
        }
        if (remoteState.mbti || !localMbti) {
          setMbtiState(remoteState.mbti ?? null);
        }
        if (Array.isArray(remoteState.favorites) && (remoteState.favorites.length > 0 || localFavorites.length === 0)) {
          setFavorites(remoteState.favorites);
        }
        if (Array.isArray(remoteState.history) && (remoteState.history.length > 0 || localHistory.length === 0)) {
          setHistory(remoteState.history);
        }
      })
      .catch((error) => {
        console.warn('Backend state restore skipped:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('sec_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (mbti) localStorage.setItem('sec_mbti_result', JSON.stringify(mbti));
    else localStorage.removeItem('sec_mbti_result');
  }, [mbti]);

  useEffect(() => {
    localStorage.setItem('sec_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('sec_history', JSON.stringify(history));
  }, [history]);

  // --- Logic Implementations ---

  const calculateCompleteness = (p: UserProfile) => {
    const fields = ['name', 'province', 'score', 'targetCity'];
    const filled = fields.filter(f => p[f as keyof UserProfile]).length;
    return Math.min(100, Math.round((filled / fields.length) * 100));
  };

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setProfile(prev => {
      const newProfile = { ...prev, ...data };
      newProfile.completeness = calculateCompleteness(newProfile);
      syncQuietly(apiClient.updateProfile(newProfile));
      return newProfile;
    });
  }, []);

  const setMBTI = useCallback((data: MBTIResult) => {
    setMbtiState(data);
    syncQuietly(apiClient.updateMbti(data));
  }, []);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        const nextFavorites = prev.filter(f => f.id !== item.id);
        syncQuietly(apiClient.replaceFavorites(nextFavorites));
        return nextFavorites;
      }
      const nextFavorites = [{ ...item, timestamp: Date.now() }, ...prev];
      syncQuietly(apiClient.replaceFavorites(nextFavorites));
      return nextFavorites;
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'timestamp' | 'id'>) => {
    setHistory(prev => {
      const newItem: HistoryItem = { 
        ...item, 
        id: crypto.randomUUID(), 
        timestamp: Date.now() 
      };
      // Remove duplicates for cleaner timeline (browsing same page)
      const filtered = prev.filter(h => !(h.type === 'browsing' && h.path === item.path));
      const nextHistory = [newItem, ...filtered].slice(0, 50);
      syncQuietly(apiClient.replaceHistory(nextHistory));
      return nextHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    syncQuietly(apiClient.clearHistory());
  }, []);

  // --- Data Management ---

  const exportData = useCallback(() => {
    const data = {
      profile,
      mbti,
      favorites,
      history,
      exportedAt: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SmartEnroll_Chronicle_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [profile, mbti, favorites, history]);

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.profile) setProfile(prev => ({ ...prev, ...data.profile }));
      if (data.mbti) setMbtiState(data.mbti);
      if (data.favorites) setFavorites(data.favorites);
      if (data.history) setHistory(data.history);
      syncQuietly(apiClient.replaceState({
        profile: data.profile ? { ...DEFAULT_PROFILE, ...data.profile } : profile,
        mbti: data.mbti ?? mbti,
        favorites: data.favorites ?? favorites,
        history: data.history ?? history
      }));
    } catch (e) {
      console.error(e);
      throw new Error('文件格式似乎有误，无法读取。');
    }
  }, [favorites, history, mbti, profile]);

  const resetData = useCallback(() => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setMbtiState(null);
    setFavorites([]);
    setHistory([]);
    syncQuietly(apiClient.resetState());
  }, []);

  return (
    <UserContext.Provider value={{
      profile, mbti, favorites, history,
      updateProfile, setMBTI, toggleFavorite, isFavorite, addToHistory, clearHistory,
      exportData, importData, resetData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
