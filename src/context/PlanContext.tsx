import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlanItem, StrategyType, MOCK_USER_PLAN } from '../data/admissions/mock_user_plan';
import type { UniversityIndexItem } from '../data/types/admissions';
import { apiClient } from '../services/apiClient';

interface PlanContextType {
  plan: PlanItem[];
  addToPlan: (university: UniversityIndexItem, strategy: StrategyType) => void;
  removeFromPlan: (uniId: string) => void;
  updatePlanStrategy: (uniId: string, strategy: StrategyType) => void;
  clearPlan: () => void;
  isInPlan: (uniId: string) => boolean;
  getPlanItem: (uniId: string) => PlanItem | undefined;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

const LEGACY_PLAN_ID_MAP: Record<string, string> = {
  u1: 'u001',
  u2: 'u002',
  u3: 'u003',
  u4: 'u005',
  u5: 'u008',
  u6: 'u004',
  u7: 'u011',
  u8: 'u013'
};

const normalizePlan = (items: PlanItem[]) => {
  const seen = new Set<string>();
  return items
    .map((item) => ({
      ...item,
      uniId: LEGACY_PLAN_ID_MAP[item.uniId] ?? item.uniId
    }))
    .filter((item) => {
      if (seen.has(item.uniId)) return false;
      seen.add(item.uniId);
      return true;
    });
};

const readLocalPlan = () => {
  try {
    const saved = localStorage.getItem('sec_user_plan');
    const parsed = saved ? JSON.parse(saved) as PlanItem[] : null;
    return parsed ? normalizePlan(parsed) : null;
  } catch {
    return null;
  }
};

const syncQuietly = (task: Promise<unknown>) => {
  task.catch((error) => {
    console.warn('Backend plan sync skipped:', error);
  });
};

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<PlanItem[]>(() => readLocalPlan() ?? normalizePlan(MOCK_USER_PLAN));

  // 1. Restore from backend when available. LocalStorage remains the static fallback.
  useEffect(() => {
    let cancelled = false;

    apiClient.getPlans()
      .then(({ items }) => {
        if (cancelled) return;
        const localPlan = readLocalPlan();
        if (items.length > 0) {
          const normalizedItems = normalizePlan(items);
          setPlan(normalizedItems);
          if (JSON.stringify(normalizedItems) !== JSON.stringify(items)) {
            syncQuietly(apiClient.replacePlans(normalizedItems));
          }
          return;
        }
        if (!localPlan) {
          syncQuietly(apiClient.replacePlans(normalizePlan(MOCK_USER_PLAN)));
        }
      })
      .catch((error) => {
        console.warn('Backend plan restore skipped:', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Persist to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('sec_user_plan', JSON.stringify(plan));
  }, [plan]);

  const addToPlan = (university: UniversityIndexItem, strategy: StrategyType) => {
    // Avoid duplicates
    if (plan.some(item => item.uniId === university.id)) return;

    const newItem: PlanItem = {
      id: crypto.randomUUID(), // Generate unique ID for the plan item
      uniId: university.id,
      universityName: university.name_cn,
      logo_char: university.logo_char,
      strategyType: strategy,
      addedDate: new Date().toISOString().split('T')[0]
    };

    setPlan(prev => {
      const nextPlan = [...prev, newItem];
      syncQuietly(apiClient.replacePlans(nextPlan));
      return nextPlan;
    });
  };

  const removeFromPlan = (uniId: string) => {
    setPlan(prev => {
      const nextPlan = prev.filter(item => item.uniId !== uniId);
      syncQuietly(apiClient.replacePlans(nextPlan));
      return nextPlan;
    });
  };

  const updatePlanStrategy = (uniId: string, strategy: StrategyType) => {
    setPlan(prev => {
      const nextPlan = prev.map(item => (
        item.uniId === uniId ? { ...item, strategyType: strategy } : item
      ));
      syncQuietly(apiClient.replacePlans(nextPlan));
      return nextPlan;
    });
  };

  const clearPlan = () => {
    setPlan([]);
    syncQuietly(apiClient.replacePlans([]));
  };

  const isInPlan = (uniId: string) => {
    return plan.some(item => item.uniId === uniId);
  };

  const getPlanItem = (uniId: string) => {
    return plan.find(item => item.uniId === uniId);
  };

  return (
    <PlanContext.Provider value={{ plan, addToPlan, removeFromPlan, updatePlanStrategy, clearPlan, isInPlan, getPlanItem }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
