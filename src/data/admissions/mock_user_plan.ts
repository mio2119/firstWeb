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

export const MOCK_USER_PLAN: PlanItem[] = [
  {
    id: "p1",
    uniId: "u1",
    universityName: "北京大学",
    logo_char: "北",
    strategyType: "rush",
    addedDate: "2024-01-15"
  },
  {
    id: "p2",
    uniId: "u3",
    universityName: "复旦大学",
    logo_char: "复",
    strategyType: "rush",
    addedDate: "2024-01-16"
  },
  {
    id: "p3",
    uniId: "u4",
    universityName: "浙江大学",
    logo_char: "浙",
    strategyType: "stable",
    addedDate: "2024-01-10"
  },
  {
    id: "p4",
    uniId: "u8",
    universityName: "武汉大学",
    logo_char: "武",
    strategyType: "safe",
    addedDate: "2024-01-12"
  },
  {
    id: "p5",
    uniId: "u7",
    universityName: "深圳大学",
    logo_char: "深",
    strategyType: "safe",
    addedDate: "2024-01-14"
  }
];