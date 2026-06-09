import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Edit3, Layout } from 'lucide-react';
import AdmissionsBackground from '../components/layout/AdmissionsBackground.tsx';
import ScoreHero from '../components/admissions/ScoreHero.tsx';
import SearchFilterBar from '../components/admissions/SearchFilterBar.tsx';
import UniversityGrid from '../components/admissions/UniversityGrid.tsx';
import UniversityDetailPanel from '../components/admissions/UniversityDetailPanel.tsx';
import PlanBlueprintSheet from '../components/admissions/PlanBlueprintSheet.tsx';
import { useData } from '../hooks/useData';
import { useUser } from '../context/UserContext';
import { hasProvinceDetailData } from '../data/admissions/detailAvailability';
import type { UniversityIndexItem } from '../data/types/admissions';

const ALL_REGIONS = "All Regions";
const ALL_TIERS = "All Tiers";

const Admissions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { addToHistory } = useUser();
  const [userScore, setUserScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityIndexItem | null>(null);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState(ALL_REGIONS);
  const [selectedTag, setSelectedTag] = useState(ALL_TIERS);

  const { data: indexData, loading: indexLoading, error: indexError } = useData<UniversityIndexItem[]>(
    'data/admissions/index_universities.json'
  );

  const universityIndex = indexData ?? [];

  const provinceMeta = useMemo(() => {
    const codeMap = new Map<string, string | undefined>();
    universityIndex.forEach((uni) => {
      if (!codeMap.has(uni.province)) {
        codeMap.set(uni.province, uni.provinceCode);
      }
    });
    const provinces = Array.from(codeMap.keys()).sort((a, b) => a.localeCompare(b));
    return { provinces: [ALL_REGIONS, ...provinces], codeMap };
  }, [universityIndex]);

  const tagOptions = useMemo(() => {
    const tagPriority = ["985", "211", "C9", "Double First-Class", "Local Top", "Innovation", "Normal", "Medical"];
    const uniqueTags = Array.from(new Set<string>(universityIndex.flatMap((uni) => uni.tags)));
    const ordered = [
      ...tagPriority.filter((tag) => uniqueTags.includes(tag)),
      ...uniqueTags.filter((tag) => !tagPriority.includes(tag)).sort((a, b) => a.localeCompare(b))
    ];
    return [ALL_TIERS, ...ordered];
  }, [universityIndex]);

  const selectedProvinceCode =
    selectedProvince === ALL_REGIONS ? null : provinceMeta.codeMap.get(selectedProvince) ?? null;
  const shouldPrefetchProvinceDetails = hasProvinceDetailData(selectedProvinceCode);
  const provinceDataPath = shouldPrefetchProvinceDetails ? `data/provinces/${selectedProvinceCode}/universities.json` : '';
  const provinceScoresPath = shouldPrefetchProvinceDetails ? `data/provinces/${selectedProvinceCode}/scores.json` : '';

  useData<Record<string, unknown>>(provinceDataPath);
  useData<Record<string, unknown>>(provinceScoresPath);

  // Handle URL Query Params (Cross-Page Linkage)
  useEffect(() => {
    const query = searchParams.get('search');
    const score = searchParams.get('score');
    const numericQuery = query && /^\d{3}$/.test(query) ? Number(query) : null;
    const scoreValue = score && /^\d{3}$/.test(score) ? Number(score) : numericQuery;

    if (scoreValue && scoreValue >= 100 && scoreValue <= 750) {
        setUserScore(scoreValue);
        setSearchQuery('');
        return;
    }

    if (query) {
        setSearchQuery(query);
    }
  }, [searchParams]);

  const handleScoreSubmit = (score: number) => {
    setIsLoading(true);
    setUserScore(score);
    // Simulate Fetching Delay for cinematic effect
    setTimeout(() => {
        setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setUserScore(0);
    setSearchQuery("");
    setSelectedProvince(ALL_REGIONS);
    setSelectedTag(ALL_TIERS);
  };

  const handleSelectUniversity = (university: UniversityIndexItem) => {
    setSelectedUniversity(university);
    addToHistory({
      type: 'browsing',
      title: `查看院校：${university.name_cn}`,
      path: `/admissions?search=${encodeURIComponent(university.name_cn)}`,
      content: `${university.province} · ${university.tags.join(' / ')}`
    });
  };

  const listingMode = userScore > 0 || searchQuery.trim().length > 0;
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchAliases: Record<string, string[]> = {
    '计算机': ['engineering', 'innovation', '科技', '软件', '人工智能'],
    '软件': ['engineering', 'innovation'],
    '人工智能': ['engineering', 'innovation'],
    '教育': ['normal', '师范'],
    '心理': ['normal', 'comprehensive'],
    '医学': ['medical'],
    '临床': ['medical'],
    '法学': ['comprehensive'],
    '金融': ['comprehensive'],
    '新闻': ['comprehensive']
  };
  const aliasTerms = Object.entries(searchAliases)
    .filter(([key]) => normalizedSearch.includes(key))
    .flatMap(([, terms]) => terms.map((term) => term.toLowerCase()));

  // Logic: Filter the index data
  const filteredUniversities = universityIndex.filter(uni => {
    // 1. Text Search (Name or CN Name)
    const searchableText = [
        uni.name,
        uni.name_cn,
        uni.province,
        uni.type,
        ...uni.tags
    ].join(' ').toLowerCase();
    const matchesSearch = !normalizedSearch ||
        uni.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        uni.name_cn.includes(searchQuery) ||
        searchableText.includes(normalizedSearch) ||
        aliasTerms.some((term) => searchableText.includes(term));

    // 2. Province Filter
    const matchesProvince = selectedProvince === ALL_REGIONS || uni.province === selectedProvince;

    // 3. Tag Filter
    const matchesTag = selectedTag === ALL_TIERS || uni.tags.some(t => t.includes(selectedTag));

    return matchesSearch && matchesProvince && matchesTag;
  });

  return (
    <div className="relative w-full min-h-[80vh] flex flex-col">
      
      {/* New Network Background */}
      <AdmissionsBackground />

      {/* Content Container (z-10 to float above background) */}
      <div className="relative z-10 flex-1 flex flex-col">
          
          {/* Detail Panel Overlay */}
          <AnimatePresence>
              {selectedUniversity && (
                  <UniversityDetailPanel 
                      university={selectedUniversity} 
                      userScore={userScore}
                      onClose={() => setSelectedUniversity(null)} 
                  />
              )}
          </AnimatePresence>

          {/* Strategic Blueprint Sheet */}
          <PlanBlueprintSheet 
              isOpen={isBlueprintOpen} 
              onClose={() => setIsBlueprintOpen(false)} 
          />

          <AnimatePresence mode="wait">
              
              {/* --- Phase 1: Score Input Hero --- */}
              {!listingMode && (
                  <motion.div
                      key="hero"
                      {...({
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0, y: -50 },
                        transition: { duration: 0.5 }
                      } as any)}
                      className="flex-1 flex flex-col justify-center"
                  >
                      <ScoreHero onSearch={handleScoreSubmit} />
                  </motion.div>
              )}

              {/* --- Phase 2: Index & Listing --- */}
              {listingMode && (
                  <motion.div
                      key="list"
                      {...({
                        initial: { opacity: 0, y: 50 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.6, ease: "easeOut" }
                      } as any)}
                  >
                      {/* --- Sticky Header & Filters --- */}
                      <div className="mb-6 flex items-center justify-between">
                          <div>
                              <h1 className="text-3xl font-serif font-bold text-[#0A2463]">院校库</h1>
                              <p className="text-slate-500 text-sm font-medium mt-1">
                                  根据您的筛选条件，共找到 {filteredUniversities.length} 所院校
                              </p>
                          </div>
                          
                          {/* Score Badge (Mini) */}
                          <button 
                              onClick={handleReset}
                              className="hidden md:flex items-center gap-3 bg-[#0A2463] text-white pl-4 pr-2 py-2 rounded-full shadow-lg shadow-[#0A2463]/20 hover:bg-amber-600 transition-colors group"
                          >
                              <div className="flex flex-col items-end leading-none">
                                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{userScore ? '我的分数' : '当前检索'}</span>
                                  <span className="text-xl font-black font-mono">
                                    {userScore ? userScore : '重置'} {userScore > 0 && <span className="text-xs font-bold">分</span>}
                                  </span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-amber-600 transition-colors">
                                  <Edit3 className="w-4 h-4" />
                              </div>
                          </button>
                      </div>

                      {/* Filter Bar Component */}
                          <SearchFilterBar
                          searchQuery={searchQuery}
                          onSearchChange={setSearchQuery}
                          selectedProvince={selectedProvince}
                          onProvinceChange={setSelectedProvince}
                          selectedTag={selectedTag}
                          onTagChange={setSelectedTag}
                          provinces={provinceMeta.provinces}
                          tags={tagOptions}
                          onResetFilters={handleReset}
                      />

                      {/* --- Content Area --- */}
                      {isLoading ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                              <motion.div 
                                  {...({
                                      animate: { rotate: 360 },
                                      transition: { duration: 1, repeat: Infinity, ease: "linear" }
                                  } as any)}
                              ><Loader2 className="w-8 h-8 text-[#0A2463]" /></motion.div>
                              <span className="text-xs font-bold uppercase tracking-widest">正在分析大数据...</span>
                          </div>
                      ) : indexLoading ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                              <motion.div 
                                  {...({
                                      animate: { rotate: 360 },
                                      transition: { duration: 1, repeat: Infinity, ease: "linear" }
                                  } as any)}
                              ><Loader2 className="w-8 h-8 text-[#0A2463]" /></motion.div>
                              <span className="text-xs font-bold uppercase tracking-widest">正在加载院校索引...</span>
                          </div>
                      ) : indexError ? (
                          <div className="flex flex-col items-center justify-center h-64 text-rose-500 gap-3">
                              <span className="text-sm font-bold">院校索引加载失败</span>
                              <span className="text-xs text-rose-400">{indexError}</span>
                          </div>
                      ) : (
                          <UniversityGrid 
                              universities={filteredUniversities} 
                              onSelect={handleSelectUniversity}
                          />
                      )}
                  </motion.div>
              )}
          </AnimatePresence>

          {/* --- Blueprint Floating Action Button (FAB) --- */}
          {listingMode && (
              <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsBlueprintOpen(true)}
                  className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-[#0A2463] text-white rounded-full shadow-2xl shadow-[#0A2463]/40 flex items-center justify-center border-2 border-white/20"
              >
                  <Layout className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0A2463]" />
              </motion.button>
          )}
      </div>
    </div>
  );
};

export default Admissions;
