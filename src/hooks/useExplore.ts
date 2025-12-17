import { useState, useMemo } from 'react';
import { useData } from './useData';
import type { CareerIndexItem } from '../data/types/explore';

export type ExploreStep = 'guide' | 'matrix';

export interface GuidePrefs {
  activity: string | null;
  value: string | null;
  investment: string | null;
}

// Result Type with Resonance Score
export interface ResonantCareer extends CareerIndexItem {
  matchScore: number;
  matchReason?: string;
}

type SynonymMap = Record<string, string[]>;

export const useExplore = () => {
  const [step, setStep] = useState<ExploreStep>('guide');
  const [userPrefs, setUserPrefs] = useState<GuidePrefs>({ activity: null, value: null, investment: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('全部');
  
  // Drawer State
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);

  const { data: indexData, loading: indexLoading, error: indexError } = useData<CareerIndexItem[]>(
    'data/explore/careers_index.json'
  );
  const { data: synonymData } = useData<SynonymMap>('data/explore/synonyms.json');

  const careersIndex = indexData ?? [];

  const categories = useMemo(() => {
    const unique = Array.from(new Set(careersIndex.map((item) => item.category)));
    return ['全部', ...unique.sort((a, b) => a.localeCompare(b))];
  }, [careersIndex]);

  const buildSearchTerms = (query: string, synonyms?: SynonymMap) => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const terms = new Set<string>([trimmed]);
    const normalized = trimmed.toLowerCase();
    if (synonyms) {
      Object.entries(synonyms).forEach(([key, values]) => {
        const normalizedKey = key.toLowerCase();
        if (normalized.includes(normalizedKey)) {
          values.forEach((val) => terms.add(val));
        }
        if (values.some((val) => normalized.includes(val.toLowerCase()))) {
          terms.add(key);
        }
      });
    }
    return Array.from(terms).map((term) => term.toLowerCase());
  };

  // --- Resonance Algorithm ---
  const calculateResonance = (career: CareerIndexItem, prefs: GuidePrefs): { score: number; reason?: string } => {
    let score = 0;
    let reasons: string[] = [];

    const weights: Array<{ tag: string | null; weight: number; reason: string }> = [
      { tag: prefs.activity, weight: 40, reason: '偏好匹配' },
      { tag: prefs.value, weight: 35, reason: '价值取向' },
      { tag: prefs.investment, weight: 25, reason: '成长节奏' }
    ];

    weights.forEach(({ tag, weight, reason }) => {
      if (tag && career.tags.includes(tag)) {
        score += weight;
        reasons.push(`${reason}：${tag}`);
      }
    });

    // Base score for simply showing up
    if (score === 0) score = 10; 

    return { score, reason: reasons[0] };
  };

  // --- Filter & Sort Logic ---
  const filteredCareers = useMemo(() => {
    let results: ResonantCareer[] = careersIndex.map(career => {
      const { score, reason } = calculateResonance(career, userPrefs);
      return { ...career, matchScore: score, matchReason: reason };
    });

    // 1. Filter by Search
    const terms = buildSearchTerms(searchQuery, synonymData);
    if (terms.length > 0) {
      results = results.filter(c => {
        const haystack = [c.title, c.shortDesc, c.category, ...c.tags].join(' ').toLowerCase();
        return terms.some(term => haystack.includes(term));
      });
    }

    // 2. Filter by Category Tag
    if (selectedTag !== '全部') {
      results = results.filter(c => c.category === selectedTag);
    }

    // 3. Sort by Resonance (High to Low)
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }, [careersIndex, userPrefs, searchQuery, selectedTag, synonymData]);

  // Actions
  const finishCompass = (prefs: GuidePrefs) => {
    setUserPrefs(prefs);
    setStep('matrix');
  };

  const resetExplore = () => {
    setStep('guide');
    setUserPrefs({ activity: null, value: null, investment: null });
    setSearchQuery('');
    setSelectedTag('全部');
  };

  return {
    step,
    userPrefs,
    finishCompass,
    resetExplore,
    // Matrix Props
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    categories,
    indexLoading,
    indexError,
    filteredCareers,
    // Drawer Props
    selectedCareerId,
    setSelectedCareerId
  };
};
