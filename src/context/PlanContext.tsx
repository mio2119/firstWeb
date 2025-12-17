import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlanItem, StrategyType, MOCK_USER_PLAN } from '../data/admissions/mock_user_plan';
import type { UniversityIndexItem } from '../data/types/admissions';

interface PlanContextType {
  plan: PlanItem[];
  addToPlan: (university: UniversityIndexItem, strategy: StrategyType) => void;
  removeFromPlan: (uniId: string) => void;
  isInPlan: (uniId: string) => boolean;
  getPlanItem: (uniId: string) => PlanItem | undefined;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plan, setPlan] = useState<PlanItem[]>([]);

  // 1. Initialize from LocalStorage (or Mock if empty for demo purposes)
  useEffect(() => {
    const saved = localStorage.getItem('sec_user_plan');
    if (saved) {
      setPlan(JSON.parse(saved));
    } else {
      // Load mock data for first-time demo feeling
      setPlan(MOCK_USER_PLAN);
    }
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

    setPlan(prev => [...prev, newItem]);
  };

  const removeFromPlan = (uniId: string) => {
    setPlan(prev => prev.filter(item => item.uniId !== uniId));
  };

  const isInPlan = (uniId: string) => {
    return plan.some(item => item.uniId === uniId);
  };

  const getPlanItem = (uniId: string) => {
    return plan.find(item => item.uniId === uniId);
  };

  return (
    <PlanContext.Provider value={{ plan, addToPlan, removeFromPlan, isInPlan, getPlanItem }}>
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
