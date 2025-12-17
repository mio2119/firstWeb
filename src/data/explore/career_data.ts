export interface CareerIndex {
  id: string;
  title: string;
  tags: string[]; // Used for matching (e.g. "Data", "Wealth")
  category: string; // "Tech", "Medical", "Art"
  shortDesc: string;
}

export interface CareerDetail extends CareerIndex {
  definition: string;
  salaryRange: string;
  typicalDay: { time: string; task: string }[];
  coreSkills: { hard: string[]; soft: string[] };
  myths: string[]; // Common misconceptions
  path: string[]; // Junior -> Senior
  relatedMajorKeywords: string[]; // For linking to Admissions
}

// 1. The Full Database (Simulating Lazy Load Structure)
export const CAREER_DB: Record<string, CareerDetail> = {
  "c1": {
    id: "c1",
    title: "AI 产品经理",
    category: "科技",
    shortDesc: "定义人工智能产品的灵魂",
    tags: ["Data", "Creativity", "Impact", "High-Growth"],
    definition: "将复杂的 AI 技术转化为用户可用的产品，是技术与商业的桥梁。",
    salaryRange: "25k - 60k / 月",
    typicalDay: [
      { time: "09:30", task: "查看算法模型昨晚的训练数据指标" },
      { time: "11:00", task: "与研发团队讨论新功能的可行性边界" },
      { time: "14:00", task: "分析用户行为数据，寻找产品迭代点" },
      { time: "16:00", task: "撰写 PRD 文档，定义下一个版本的 AI 交互逻辑" }
    ],
    coreSkills: {
      hard: ["数据分析", "原型设计", "技术理解力", "A/B Testing"],
      soft: ["沟通协作", "商业洞察", "同理心", "决策力"]
    },
    myths: ["必须会写代码才能做", "只负责画图，不负责结果"],
    path: ["产品专员", "产品经理", "高级产品经理", "产品总监", "CPO"],
    relatedMajorKeywords: ["计算机", "心理学", "信息管理"]
  },
  "c2": {
    id: "c2",
    title: "临床外科医生",
    category: "医学",
    shortDesc: "在此刻，与死神赛跑",
    tags: ["People", "Things", "Stability", "Impact", "Long-term"],
    definition: "在手术台上与死神赛跑，用精湛的技艺修复生命的“工程师”。",
    salaryRange: "20k - 80k / 月",
    typicalDay: [
      { time: "07:30", task: "早查房，了解住院病人术后恢复情况" },
      { time: "09:00", task: "开始第一台手术（通常持续数小时）" },
      { time: "13:00", task: "短暂午餐，讨论疑难病例" },
      { time: "15:00", task: "门诊坐诊，接待初诊病人" }
    ],
    coreSkills: {
      hard: ["解剖学", "病理诊断", "手术操作", "药理学"],
      soft: ["抗压能力", "专注力", "终身学习", "医患沟通"]
    },
    myths: ["医生都知道怎么治病", "越老越吃香（外科对外科医生体力要求极高）"],
    path: ["住院医师", "主治医师", "副主任医师", "主任医师", "科室主任"],
    relatedMajorKeywords: ["临床医学", "麻醉学"]
  },
  "c3": {
    id: "c3",
    title: "数字媒体艺术家",
    category: "艺术",
    shortDesc: "用代码编织视觉梦境",
    tags: ["Creativity", "Things", "Freedom", "Quick-Start"],
    definition: "结合编程技术与视觉美学，创造沉浸式互动体验的新时代创作者。",
    salaryRange: "15k - 50k / 月",
    typicalDay: [
      { time: "10:00", task: "寻找灵感，浏览 ArtStation 和 Pinterest" },
      { time: "11:30", task: "使用 TouchDesigner 调试视觉特效" },
      { time: "15:00", task: "与策展人沟通展览现场的投影方案" },
      { time: "20:00", task: "深夜 coding，优化粒子系统的性能" }
    ],
    coreSkills: {
      hard: ["Unity/UE5", "Shader 编程", "3D 建模", "视觉设计"],
      soft: ["审美能力", "创新思维", "跨界整合", "表达欲"]
    },
    myths: ["就是画画的", "找不到工作（其实商业展陈需求巨大）"],
    path: ["初级设计师", "主创设计师", "艺术总监", "独立艺术家"],
    relatedMajorKeywords: ["数字媒体艺术", "计算机", "视觉传达"]
  },
  "c4": {
    id: "c4",
    title: "量化交易员",
    category: "金融",
    shortDesc: "用数学模型预测市场脉搏",
    tags: ["Data", "Wealth", "High-Pressure", "Quick-Start"],
    definition: "利用数学模型和计算机算法，在金融市场中寻找套利机会的精英。",
    salaryRange: "50k - 200k / 月",
    typicalDay: [
      { time: "08:30", task: "检查隔夜市场数据，调整策略参数" },
      { time: "09:30", task: "开盘监控，实时跟踪算法交易执行情况" },
      { time: "15:00", task: "收盘复盘，分析策略盈亏归因" },
      { time: "17:00", task: "阅读最新论文，研究新的因子挖掘方法" }
    ],
    coreSkills: {
      hard: ["Python/C++", "统计学", "机器学习", "金融工程"],
      soft: ["风险厌恶", "极度理性", "快速反应", "抗压"]
    },
    myths: ["像华尔街之狼一样打电话（全是机器自动交易）", "稳赚不赔"],
    path: ["量化研究员", "基金经理", "合伙人"],
    relatedMajorKeywords: ["金融工程", "数学", "统计学"]
  },
  "c5": {
    id: "c5",
    title: "非诉律师",
    category: "法律",
    shortDesc: "商业巨轮的护航者",
    tags: ["Data", "People", "Wealth", "Stability", "Long-term"],
    definition: "不打官司的律师，专注于公司上市、并购重组等商业交易的法律风控。",
    salaryRange: "20k - 70k / 月",
    typicalDay: [
      { time: "09:00", task: "尽职调查，翻阅目标公司的海量合同" },
      { time: "14:00", task: "起草 IPO 招股说明书的法律意见书" },
      { time: "16:00", task: "与客户开会，谈判交易条款" },
      { time: "21:00", task: "回复监管机构的反馈意见" }
    ],
    coreSkills: {
      hard: ["法律检索", "合同起草", "商业逻辑", "英语"],
      soft: ["严谨细致", "逻辑思维", "客户服务", "时间管理"]
    },
    myths: ["天天在法庭唇枪舌剑", "一定要背很多法条"],
    path: ["律师助理", "主办律师", "初级合伙人", "高级合伙人"],
    relatedMajorKeywords: ["法学", "经济法"]
  }
};

// 2. The Index Array (Generated from DB for the Grid)
export const CAREER_INDEX: CareerIndex[] = Object.values(CAREER_DB).map(c => ({
  id: c.id,
  title: c.title,
  tags: c.tags,
  category: c.category,
  shortDesc: c.shortDesc
}));