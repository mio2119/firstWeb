export interface UniversityIndexItem {
  id: string;
  name: string;
  name_cn: string;
  province: string;
  provinceCode?: string;
  tags: string[];
  ranking: number;
  type: string;
  logo_char: string;
}

export interface UniversityHistoryScore {
  year: number;
  score: number;
  rank: number;
}

export interface UniversityDetail {
  id: string;
  description: string;
  aceMajors: string[];
  scoreLine2024: number;
  minRank: number;
  location: string;
  established: number;
  studentCount: string;
  motto: string;
  historyScores: UniversityHistoryScore[];
}

export type StrategyType = 'rush' | 'stable' | 'safe';

export interface PlanItem {
  id: string;
  uniId: string;
  universityName: string;
  logo_char: string;
  majorName?: string;
  strategyType: StrategyType;
  addedDate: string;
}
