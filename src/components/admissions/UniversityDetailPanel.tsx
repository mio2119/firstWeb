import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, MapPin, Users, BookOpen, AlertCircle, CheckCircle2, Target, Trophy, TrendingUp, Lightbulb, GraduationCap, Briefcase, AlertTriangle, ArrowRightLeft, Heart } from 'lucide-react';
import AddToPlanButton from './AddToPlanButton.tsx';
import { useData } from '../../hooks/useData';
import { useUser } from '../../context/UserContext';
import { hasProvinceDetailData } from '../../data/admissions/detailAvailability';
import type { UniversityDetail, UniversityHistoryScore, UniversityIndexItem } from '../../data/types/admissions';

/** Local interface for majorDecode — will be available once Codex extends the type */
interface MajorDecodeItem {
  major: string;
  fitScore: number;
  coreCourses: string[];
  abilityRequirements: string[];
  careerPaths: string[];
  matchReasons: string[];
  riskTips: string[];
  alternativePaths: string[];
}

type UniversityDetailBase = Omit<UniversityDetail, 'historyScores'> & {
  historyScores?: UniversityHistoryScore[];
  majorDecode?: MajorDecodeItem[];
};

interface ProvinceUniversitiesPayload {
  province: string;
  provinceCode: string;
  universities: UniversityDetailBase[];
}

interface ProvinceScoresPayload {
  provinceCode: string;
  scores: Record<string, UniversityHistoryScore[]>;
}

interface UniversityDetailPanelProps {
  university: UniversityIndexItem;
  userScore: number;
  onClose: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getFallbackMajors = (university: UniversityIndexItem) => {
  const type = university.type.toLowerCase();
  if (type.includes('engineering') || type.includes('science')) {
    return ['计算机科学与技术', '人工智能', '电子信息工程', '数据科学'];
  }
  if (type.includes('medical') || university.tags.some((tag) => tag.toLowerCase().includes('medical'))) {
    return ['临床医学', '公共卫生', '药学', '生物医学工程'];
  }
  if (type.includes('normal')) {
    return ['教育学', '心理学', '汉语言文学', '数学与应用数学'];
  }
  if (type.includes('finance') || type.includes('economics')) {
    return ['金融学', '经济学', '会计学', '数据分析'];
  }
  return ['法学', '经济学', '计算机科学与技术', '新闻传播学'];
};

const createFallbackDetail = (
  university: UniversityIndexItem
): UniversityDetail & { majorDecode?: MajorDecodeItem[]; isFallback?: boolean } => {
  const isTopTier = university.tags.some((tag) => ['985', 'C9'].includes(tag));
  const isDoubleFirstClass = university.tags.includes('Double First-Class');
  const rankingFactor = clamp(60 - university.ranking, 0, 60);
  const scoreLine2024 = clamp(
    Math.round(560 + rankingFactor * 1.8 + (isTopTier ? 22 : 0) + (isDoubleFirstClass ? 10 : 0)),
    530,
    695
  );
  const minRank = clamp(university.ranking * 140, 50, 18000);
  const aceMajors = getFallbackMajors(university);

  return {
    id: university.id,
    description: `${university.name_cn} 当前使用院校索引生成基础画像。可先参考院校层次、地区、类型和分数估算完成收藏、志愿蓝图与初步对比；后续补充省份详情数据后会自动展示更完整的专业解码。`,
    aceMajors,
    scoreLine2024,
    minRank,
    location: university.province,
    established: 1950,
    studentCount: '数据待补充',
    motto: '以官方招生章程为准',
    historyScores: [
      { year: 2023, score: scoreLine2024 - 2, rank: minRank + 180 },
      { year: 2022, score: scoreLine2024 - 5, rank: minRank + 420 },
      { year: 2021, score: scoreLine2024 + 3, rank: Math.max(1, minRank - 220) }
    ],
    majorDecode: [
      {
        major: aceMajors[0],
        fitScore: isTopTier ? 88 : 82,
        coreCourses: ['通识基础', '专业导论', '实践项目', '数据分析'],
        abilityRequirements: ['持续学习', '信息检索', '逻辑表达', '项目协作'],
        careerPaths: ['专业深造', '行业项目岗位', '公共服务与研究', '复合型管理岗位'],
        matchReasons: [
          `${university.name_cn} 的院校层次和 ${university.type} 类型适合作为初步志愿对比样本。`,
          '在完整省份数据补齐前，可先用该画像判断冲稳保结构和专业方向是否匹配。'
        ],
        riskTips: [
          '该详情为基础估算，最终录取判断仍应结合省排位、招生计划和官方专业组数据。',
          '热门专业分数通常高于院校最低线，加入志愿蓝图后仍需二次核验。'
        ],
        alternativePaths: aceMajors.slice(1)
      }
    ],
    isFallback: true
  };
};

const UniversityDetailPanel: React.FC<UniversityDetailPanelProps> = ({ university, userScore, onClose }) => {
  const { toggleFavorite, isFavorite } = useUser();
  const provinceCode = university.provinceCode;
  const hasDetailedProvince = hasProvinceDetailData(provinceCode);
  const provincePath = hasDetailedProvince ? `data/provinces/${provinceCode}/universities.json` : '';
  const scoresPath = hasDetailedProvince ? `data/provinces/${provinceCode}/scores.json` : '';

  const { data: provinceData, loading: provinceLoading, error: provinceError } = useData<ProvinceUniversitiesPayload>(provincePath);
  const { data: scoresData, loading: scoresLoading, error: scoresError } = useData<ProvinceScoresPayload>(scoresPath);

  const details = useMemo<(UniversityDetail & { majorDecode?: MajorDecodeItem[] }) | null>(() => {
    if (!provinceData) return null;
    const entry = provinceData.universities.find((item) => item.id === university.id);
    if (!entry) return null;
    const historyScores = scoresData?.scores?.[university.id] ?? entry.historyScores ?? [];
    return { ...entry, historyScores };
  }, [provinceData, scoresData, university.id]);

  const fallbackDetails = useMemo(() => createFallbackDetail(university), [university]);
  const displayDetails = details ?? fallbackDetails;

  const loading = hasDetailedProvince && (provinceLoading || scoresLoading);
  const dataNotice = details ? null : (
    hasDetailedProvince && (provinceError || scoresError)
      ? '完整详情数据暂不可用，已使用院校索引生成基础分析。'
      : '当前省份暂无完整详情数据，已使用院校索引生成基础分析。'
  );

  const favoriteId = `university:${university.id}`;
  const saved = isFavorite(favoriteId);

  const handleFavorite = () => {
    toggleFavorite({
      id: favoriteId,
      type: 'university',
      title: university.name_cn,
      subtitle: `${university.province} · ${university.tags.join(' / ')}`,
      tags: university.tags,
      path: `/admissions?search=${encodeURIComponent(university.name_cn)}`
    });
  };

  // Probability Logic
  const getProbabilityStatus = (uniScore: number) => {
    const diff = userScore - uniScore;
    if (diff >= 10) return { label: 'Safe', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2, desc: "High admission probability." };
    if (diff >= -5) return { label: 'Reachable', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', icon: Target, desc: "Competitive but possible." };
    return { label: 'Risky', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', icon: AlertCircle, desc: "Requires significant effort." };
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div 
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm"
        {...({
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        } as any)}
      />

      {/* Slide-in Panel */}
      <motion.div 
        className="fixed inset-y-0 right-0 z-[110] w-full md:w-[600px] bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-white/50 overflow-hidden flex flex-col"
        {...({
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
          transition: { type: "spring", stiffness: 300, damping: 30 }
        } as any)}
      >
        {/* --- Header --- */}
        <div className="relative h-48 bg-[#0A2463] flex flex-col justify-end p-8 overflow-hidden shrink-0">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            <div className="absolute top-0 right-0 p-32 bg-amber-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            {/* Add to Plan Button (Absolute Positioning in Header) */}
            <div className="absolute bottom-6 right-8 z-20">
                <AddToPlanButton university={university} />
            </div>

            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-30"
                title="关闭"
            >
                <X className="w-5 h-5" />
            </button>

            <button
                onClick={handleFavorite}
                className={`absolute top-6 right-20 p-2 rounded-full transition-colors z-30 ${
                    saved ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={saved ? '取消收藏' : '收藏院校'}
            >
                <Heart className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
            </button>

            <div className="relative z-10 flex items-end gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl font-black font-serif text-[#0A2463]">
                    {university.logo_char}
                </div>
                <div className="mb-1">
                    <h2 className="text-3xl font-serif font-bold text-white mb-1">{university.name_cn}</h2>
                    <p className="text-white/60 font-medium tracking-wide text-sm">{university.name} • {university.province}</p>
                </div>
            </div>
        </div>

        {/* --- Content Scroll Area --- */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            
            {loading ? (
                // Skeleton Loader
                <div className="space-y-8 animate-pulse">
                    <div className="h-32 bg-slate-100 rounded-2xl" />
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-100 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 rounded w-full" />
                        <div className="h-4 bg-slate-100 rounded w-5/6" />
                    </div>
                    <div className="h-40 bg-slate-100 rounded-2xl" />
                </div>
            ) : displayDetails ? (
                <div className="space-y-10">
                    {dataNotice && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                            {dataNotice}
                        </div>
                    )}
                    
                    {/* 1. Admission Analysis (The Core Feature) */}
                    <section className="relative overflow-hidden bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-5 h-5 text-[#0A2463]" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Admission Probability</h3>
                        </div>

                        {userScore > 0 ? (
                            <div>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium mb-1">Your Score vs. {displayDetails.scoreLine2024} (2024 Line)</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black font-mono text-[#0A2463]">{userScore}</span>
                                            <span className={`text-sm font-bold ${userScore >= displayDetails.scoreLine2024 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {userScore >= displayDetails.scoreLine2024 ? '+' : ''}{userScore - displayDetails.scoreLine2024} pts
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Probability Badge */}
                                    {(() => {
                                        const status = getProbabilityStatus(displayDetails.scoreLine2024);
                                        const StatusIcon = status.icon;
                                        return (
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${status.bg} border border-transparent`}>
                                                <StatusIcon className={`w-5 h-5 ${status.text}`} strokeWidth={2.5} />
                                                <div className="flex flex-col items-start">
                                                    <span className={`text-sm font-black uppercase ${status.text}`}>{status.label}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                {/* Progress Meter */}
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    {/* The "Safe" Zone Marker */}
                                    <div className="absolute left-[80%] top-0 bottom-0 w-0.5 bg-white/50 z-10" /> 
                                    <motion.div 
                                        className={`h-full ${getProbabilityStatus(displayDetails.scoreLine2024).color}`}
                                        {...({
                                          initial: { width: 0 },
                                          animate: { width: `${Math.min(100, Math.max(0, ((userScore - (displayDetails.scoreLine2024 - 50)) / 100) * 100))}%` },
                                          transition: { duration: 1, delay: 0.2 }
                                        } as any)}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 font-medium">{getProbabilityStatus(displayDetails.scoreLine2024).desc}</p>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Enter your score to see analysis</p>
                            </div>
                        )}
                    </section>

                    {/* 2. University Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Location</span>
                            </div>
                            <p className="font-serif font-bold text-slate-700">{displayDetails.location}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Students</span>
                            </div>
                            <p className="font-serif font-bold text-slate-700">{displayDetails.studentCount}</p>
                        </div>
                    </div>

                    {/* 3. Description */}
                    <section>
                        <h3 className="text-lg font-serif font-bold text-[#0A2463] mb-4">About Institution</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{displayDetails.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1.5 rounded-lg">
                            <BookOpen className="w-3 h-3" />
                            Motto: "{displayDetails.motto}"
                        </div>
                    </section>

                    {/* 4. Ace Majors */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h3 className="text-lg font-serif font-bold text-[#0A2463]">Ace Majors</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {displayDetails.aceMajors.map(major => (
                                <span key={major} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:border-[#0A2463] transition-colors cursor-default">
                                    {major}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* 5. Major Decode — 专业黑盒解码 (conditional) */}
                    {displayDetails.majorDecode && displayDetails.majorDecode.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-2">
                                <GraduationCap className="w-5 h-5 text-[#0A2463]" />
                                <h3 className="text-lg font-serif font-bold text-[#0A2463]">专业解码</h3>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-4">Black-box Decode · 示例数据</p>

                            <div className="space-y-6">
                                {displayDetails.majorDecode.map((decode, idx) => (
                                    <motion.div
                                        key={decode.major}
                                        className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 space-y-4"
                                        {...({
                                          initial: { opacity: 0, y: 10 },
                                          animate: { opacity: 1, y: 0 },
                                          transition: { duration: 0.4, delay: idx * 0.1 }
                                        } as any)}
                                    >
                                        {/* Major Header */}
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-[#0A2463] text-base">{decode.major}</h4>
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                                适配 {decode.fitScore}%
                                            </span>
                                        </div>

                                        {/* Match Reasons */}
                                        {decode.matchReasons.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">推荐理由</span>
                                                </div>
                                                <ul className="space-y-1">
                                                    {decode.matchReasons.map((r, i) => (
                                                        <li key={i} className="text-xs text-slate-600 leading-relaxed pl-3 relative before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-400">{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Core Courses */}
                                        {decode.coreCourses.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <BookOpen className="w-3.5 h-3.5 text-[#0A2463]" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">核心课程</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {decode.coreCourses.map((c, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[11px] font-medium">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Ability Requirements */}
                                        {decode.abilityRequirements.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Target className="w-3.5 h-3.5 text-[#0A2463]" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">能力要求</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {decode.abilityRequirements.map((a, i) => (
                                                        <span key={i} className="px-2 py-1 bg-blue-50 border border-blue-100 text-[#0A2463] rounded text-[11px] font-medium">{a}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Career Paths */}
                                        {decode.careerPaths.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">职业路径</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {decode.careerPaths.map((p, i) => (
                                                        <span key={i} className="px-2 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded text-[11px] font-medium">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Risk Tips */}
                                        {decode.riskTips.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">风险提示</span>
                                                </div>
                                                <ul className="space-y-1">
                                                    {decode.riskTips.map((t, i) => (
                                                        <li key={i} className="text-xs text-slate-600 leading-relaxed pl-3 relative before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-rose-300">{t}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Alternative Paths */}
                                        {decode.alternativePaths.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">替代路径</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {decode.alternativePaths.map((alt, i) => (
                                                        <span key={i} className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[11px] font-medium">{alt}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            ) : (
                <div className="py-16 text-center">
                    <p className="text-sm font-bold text-slate-400">暂无该院校的详细数据</p>
                </div>
            )}
        </div>
      </motion.div>
    </>,
    document.body
  );
};

export default UniversityDetailPanel;
