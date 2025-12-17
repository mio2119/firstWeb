export interface University {
  id: string;
  name: string;
  name_cn: string;
  province: string;
  tags: string[];
  ranking: number;
  type: string;
  logo_char: string; // Placeholder for logo image
}

export const MOCK_UNIVERSITIES: University[] = [
  { 
    id: "u1", 
    name: "Peking University", 
    name_cn: "北京大学", 
    province: "Beijing", 
    tags: ["985", "Double First-Class", "C9"], 
    ranking: 1, 
    type: "Comprehensive",
    logo_char: "北"
  },
  { 
    id: "u2", 
    name: "Tsinghua University", 
    name_cn: "清华大学", 
    province: "Beijing", 
    tags: ["985", "Double First-Class", "C9"], 
    ranking: 2, 
    type: "Engineering",
    logo_char: "清"
  },
  { 
    id: "u3", 
    name: "Fudan University", 
    name_cn: "复旦大学", 
    province: "Shanghai", 
    tags: ["985", "C9", "Humanities"], 
    ranking: 3, 
    type: "Comprehensive",
    logo_char: "复"
  },
  { 
    id: "u4", 
    name: "Zhejiang University", 
    name_cn: "浙江大学", 
    province: "Zhejiang", 
    tags: ["985", "C9"], 
    ranking: 4, 
    type: "Comprehensive",
    logo_char: "浙"
  },
  { 
    id: "u5", 
    name: "Sun Yat-sen University", 
    name_cn: "中山大学", 
    province: "Guangdong", 
    tags: ["985", "Double First-Class"], 
    ranking: 10, 
    type: "Comprehensive",
    logo_char: "中"
  },
  { 
    id: "u6", 
    name: "Shanghai Jiao Tong", 
    name_cn: "上海交通大学", 
    province: "Shanghai", 
    tags: ["985", "C9"], 
    ranking: 5, 
    type: "Engineering",
    logo_char: "交"
  },
  { 
    id: "u7", 
    name: "Shenzhen University", 
    name_cn: "深圳大学", 
    province: "Guangdong", 
    tags: ["Local Top", "Innovation"], 
    ranking: 45, 
    type: "Comprehensive",
    logo_char: "深"
  },
  { 
    id: "u8", 
    name: "Wuhan University", 
    name_cn: "武汉大学", 
    province: "Hubei", 
    tags: ["985", "Double First-Class"], 
    ranking: 9, 
    type: "Comprehensive",
    logo_char: "武"
  }
];