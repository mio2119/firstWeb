import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization (Lazy Load from LocalStorage)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sec_user_profile');
    // MERGE logic: Ensure we have all default fields even if LS has partial data
    return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
  });

  const [mbti, setMbtiState] = useState<MBTIResult | null>(() => {
    const saved = localStorage.getItem('sec_mbti_result');
    return saved ? JSON.parse(saved) : null;
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem('sec_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('sec_history');
    return saved ? JSON.parse(saved) : [];
  });

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
      return newProfile;
    });
  }, []);

  const setMBTI = useCallback((data: MBTIResult) => {
    setMbtiState(data);
  }, []);

  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'timestamp'>) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id === item.id);
      if (exists) {
        return prev.filter(f => f.id !== item.id);
      } else {
        return [{ ...item, timestamp: Date.now() }, ...prev];
      }
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
      return [newItem, ...filtered].slice(0, 50);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
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
      
      alert('档案读取成功，欢迎回来。');
    } catch (e) {
      console.error(e);
      alert('文件格式似乎有误，无法读取。');
    }
  }, []);

  const resetData = useCallback(() => {
    if (confirm("您确定要封存这份档案并重新开始吗？此操作不可撤销。")) {
      localStorage.clear();
      setProfile(DEFAULT_PROFILE);
      setMbtiState(null);
      setFavorites([]);
      setHistory([]);
      alert("新篇章已开启。");
    }
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