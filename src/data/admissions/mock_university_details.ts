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
  historyScores: { year: number; score: number; rank: number }[];
}

const DETAILS_DB: Record<string, UniversityDetail> = {
  "u1": {
    id: "u1",
    description: "Peking University is a major research university in Beijing, China, and a member of the C9 League. It is widely recognized as one of the most prestigious universities in China.",
    aceMajors: ["Chinese Literature", "Fundamental Mathematics", "Chemistry", "Law"],
    scoreLine2024: 689,
    minRank: 50,
    location: "Haidian District, Beijing",
    established: 1898,
    studentCount: "30,000+",
    motto: "Patriotism, Progress, Democracy, Science",
    historyScores: [
      { year: 2023, score: 691, rank: 45 },
      { year: 2022, score: 688, rank: 52 },
      { year: 2021, score: 695, rank: 48 }
    ]
  },
  "u2": {
    id: "u2",
    description: "Tsinghua University is a major research university in Beijing, and a member of the C9 League. It is consistently ranked as one of the top universities in Asia.",
    aceMajors: ["Computer Science", "Architecture", "Civil Engineering", "Physics"],
    scoreLine2024: 691,
    minRank: 40,
    location: "Haidian District, Beijing",
    established: 1911,
    studentCount: "36,000+",
    motto: "Self-Discipline and Social Commitment",
    historyScores: [
      { year: 2023, score: 693, rank: 38 },
      { year: 2022, score: 690, rank: 42 },
      { year: 2021, score: 698, rank: 35 }
    ]
  },
  // Default fallback for others to ensure the demo works for all cards
  "default": {
    id: "default",
    description: "A prestigious institution with a focus on comprehensive education and innovative research. Known for its rigorous academic environment and vibrant campus culture.",
    aceMajors: ["Artificial Intelligence", "Economics", "Clinical Medicine"],
    scoreLine2024: 630,
    minRank: 1200,
    location: "China",
    established: 1950,
    studentCount: "25,000+",
    motto: "Truth and Service",
    historyScores: [
      { year: 2023, score: 635, rank: 1100 },
      { year: 2022, score: 628, rank: 1250 },
      { year: 2021, score: 640, rank: 1050 }
    ]
  }
};

export const fetchUniversityDetails = (id: string): Promise<UniversityDetail> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DETAILS_DB[id] || { ...DETAILS_DB["default"], id, scoreLine2024: 600 + Math.floor(Math.random() * 100) });
    }, 800); // Simulate 800ms network delay
  });
};