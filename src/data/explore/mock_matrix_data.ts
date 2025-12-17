export type ItemType = 'career' | 'major';

export interface ExploreItem {
  id: string;
  type: ItemType;
  title: string;
  tags: string[];
  // Career specific
  relatedMajorId?: string;
  salary?: string;
  growth?: string; // e.g. "High Growth"
  roadmap?: string[]; // e.g. ["Junior", "Senior", "Lead"]
  skills?: string[];
  linkedMajorKeyword?: string; // For auto-search in Admissions
  // Major specific
  category?: string; // e.g. "工科", "人文"
  degree?: string;
}

export const MOCK_MATRIX_DATA: ExploreItem[] = [
  // --- Majors ---
  {
    id: "m1",
    type: "major",
    title: "计算机科学与技术",
    category: "工学",
    tags: ["热门", "逻辑思维", "高薪"],
    degree: "工学学士"
  },
  {
    id: "m2",
    type: "major",
    title: "法学",
    category: "法学",
    tags: ["严谨", "辩论", "公务员"],
    degree: "法学学士"
  },
  {
    id: "m3",
    type: "major",
    title: "临床医学",
    category: "医学",
    tags: ["精英", "长学制", "高门槛"],
    degree: "医学博士"
  },
  {
    id: "m4",
    type: "major",
    title: "金融工程",
    category: "经济学",
    tags: ["数学", "搞钱", "高压"],
    degree: "经济学学士"
  },
  {
    id: "m5",
    type: "major",
    title: "数字媒体艺术",
    category: "艺术",
    tags: ["创意", "设计", "游戏"],
    degree: "艺术学学士"
  },
  // --- Careers ---
  {
    id: "c1",
    type: "career",
    title: "AI 算法工程师",
    relatedMajorId: "m1",
    tags: ["INTJ", "INTP", "技术前沿"],
    salary: "¥30k - ¥60k / 月",
    growth: "高速增长",
    roadmap: ["初级算法工程师", "模型优化专家", "AI 架构师", "CTO"],
    skills: ["Python", "PyTorch", "TensorFlow", "数学建模"],
    linkedMajorKeyword: "计算机"
  },
  {
    id: "c2",
    type: "career",
    title: "非诉律师",
    relatedMajorId: "m2",
    tags: ["ESTJ", "ENTJ", "商务精英"],
    salary: "¥20k - ¥50k / 月",
    growth: "稳定上升",
    roadmap: ["律师助理", "主办律师", "初级合伙人", "高级合伙人"],
    skills: ["法律英语", "尽职调查", "合同起草", "谈判"],
    linkedMajorKeyword: "法学"
  },
  {
    id: "c3",
    type: "career",
    title: "外科医生",
    relatedMajorId: "m3",
    tags: ["ISTJ", "ESTP", "抗压"],
    salary: "¥25k - ¥80k / 月",
    growth: "稀缺人才",
    roadmap: ["住院医师", "主治医师", "副主任医师", "主任医师"],
    skills: ["临床诊断", "手术操作", "病理分析", "极度专注"],
    linkedMajorKeyword: "医学"
  },
  {
    id: "c4",
    type: "career",
    title: "量化交易员",
    relatedMajorId: "m4",
    tags: ["INTJ", "ENTP", "极客"],
    salary: "¥50k - ¥100k / 月",
    growth: "极高回报",
    roadmap: ["量化研究员", "基金经理", "合伙人"],
    skills: ["C++", "统计套利", "高频交易算法", "风险控制"],
    linkedMajorKeyword: "金融"
  },
  {
    id: "c5",
    type: "career",
    title: "游戏制作人",
    relatedMajorId: "m5",
    tags: ["ENFP", "ENTP", "创造力"],
    salary: "¥20k - ¥70k / 月",
    growth: "创意驱动",
    roadmap: ["关卡策划", "主策划", "制作人", "工作室负责人"],
    skills: ["游戏引擎", "数值策划", "项目管理", "审美能力"],
    linkedMajorKeyword: "艺术"
  }
];