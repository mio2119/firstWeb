export interface CareerIndexItem {
  id: string;
  title: string;
  tags: string[];
  category: string;
  shortDesc: string;
}

export interface CareerDetail {
  id: string;
  title: string;
  category: string;
  definition: string;
  typicalDay: { time: string; task: string }[];
  coreSkills: { hard: string[]; soft: string[] };
  fit: string[];
  unfit: string[];
  myths: string[];
  path: string[];
  relatedMajors: string[];
  learningPath: string[];
}
