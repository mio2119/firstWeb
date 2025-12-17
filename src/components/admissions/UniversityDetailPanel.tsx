import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Users, BookOpen, AlertCircle, CheckCircle2, Target, Trophy, TrendingUp } from 'lucide-react';
import AddToPlanButton from './AddToPlanButton.tsx';
import { useData } from '../../hooks/useData';
import type { UniversityDetail, UniversityHistoryScore, UniversityIndexItem } from '../../data/types/admissions';

type UniversityDetailBase = Omit<UniversityDetail, 'historyScores'> & { historyScores?: UniversityHistoryScore[] };

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

const UniversityDetailPanel: React.FC<UniversityDetailPanelProps> = ({ university, userScore, onClose }) => {
  const provinceCode = university.provinceCode;
  const provincePath = provinceCode ? `data/provinces/${provinceCode}/universities.json` : '';
  const scoresPath = provinceCode ? `data/provinces/${provinceCode}/scores.json` : '';

  const { data: provinceData, loading: provinceLoading, error: provinceError } = useData<ProvinceUniversitiesPayload>(provincePath);
  const { data: scoresData, loading: scoresLoading, error: scoresError } = useData<ProvinceScoresPayload>(scoresPath);

  const details = useMemo<UniversityDetail | null>(() => {
    if (!provinceData) return null;
    const entry = provinceData.universities.find((item) => item.id === university.id);
    if (!entry) return null;
    const historyScores = scoresData?.scores?.[university.id] ?? entry.historyScores ?? [];
    return { ...entry, historyScores };
  }, [provinceData, scoresData, university.id]);

  const loading = Boolean(provinceCode) && (provinceLoading || scoresLoading);
  const errorMessage = !provinceCode
    ? '该院校未配置省份数据，暂无法加载详情。'
    : (provinceError || scoresError);
  const friendlyError = useMemo(() => {
    if (!errorMessage) return null;
    if (errorMessage.includes('HTTP 404')) {
      return '该省份暂无院校详情数据';
    }
    return errorMessage;
  }, [errorMessage]);

  // Probability Logic
  const getProbabilityStatus = (uniScore: number) => {
    const diff = userScore - uniScore;
    if (diff >= 10) return { label: 'Safe', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2, desc: "High admission probability." };
    if (diff >= -5) return { label: 'Reachable', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', icon: Target, desc: "Competitive but possible." };
    return { label: 'Risky', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', icon: AlertCircle, desc: "Requires significant effort." };
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm"
        {...({
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        } as any)}
      />

      {/* Slide-in Panel */}
      <motion.div 
        className="fixed inset-y-0 right-0 z-[60] w-full md:w-[600px] bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-white/50 overflow-hidden flex flex-col"
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
            >
                <X className="w-5 h-5" />
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
            ) : friendlyError ? (
                <div className="py-16 text-center">
                    <p className="text-sm font-bold text-rose-500">详情加载失败</p>
                    <p className="text-xs text-rose-400 mt-2">{friendlyError}</p>
                </div>
            ) : details ? (
                <div className="space-y-10">
                    
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
                                        <p className="text-sm text-slate-500 font-medium mb-1">Your Score vs. {details.scoreLine2024} (2024 Line)</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-black font-mono text-[#0A2463]">{userScore}</span>
                                            <span className={`text-sm font-bold ${userScore >= details.scoreLine2024 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {userScore >= details.scoreLine2024 ? '+' : ''}{userScore - details.scoreLine2024} pts
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Probability Badge */}
                                    {(() => {
                                        const status = getProbabilityStatus(details.scoreLine2024);
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
                                        className={`h-full ${getProbabilityStatus(details.scoreLine2024).color}`}
                                        {...({
                                          initial: { width: 0 },
                                          animate: { width: `${Math.min(100, Math.max(0, ((userScore - (details.scoreLine2024 - 50)) / 100) * 100))}%` },
                                          transition: { duration: 1, delay: 0.2 }
                                        } as any)}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 font-medium">{getProbabilityStatus(details.scoreLine2024).desc}</p>
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
                            <p className="font-serif font-bold text-slate-700">{details.location}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase">Students</span>
                            </div>
                            <p className="font-serif font-bold text-slate-700">{details.studentCount}</p>
                        </div>
                    </div>

                    {/* 3. Description */}
                    <section>
                        <h3 className="text-lg font-serif font-bold text-[#0A2463] mb-4">About Institution</h3>
                        <p className="text-slate-600 leading-relaxed text-sm">{details.description}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 inline-block px-3 py-1.5 rounded-lg">
                            <BookOpen className="w-3 h-3" />
                            Motto: "{details.motto}"
                        </div>
                    </section>

                    {/* 4. Ace Majors */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            <h3 className="text-lg font-serif font-bold text-[#0A2463]">Ace Majors</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {details.aceMajors.map(major => (
                                <span key={major} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm hover:border-[#0A2463] transition-colors cursor-default">
                                    {major}
                                </span>
                            ))}
                        </div>
                    </section>

                </div>
            ) : (
                <div className="py-16 text-center">
                    <p className="text-sm font-bold text-slate-400">暂无该院校的详细数据</p>
                </div>
            )}
        </div>
      </motion.div>
    </>
  );
};

export default UniversityDetailPanel;
