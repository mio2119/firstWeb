import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Clock, AlertTriangle, ArrowRight, BrainCircuit, Heart, Loader2 } from 'lucide-react';
import { useData } from '../../hooks/useData';
import type { CareerDetail } from '../../data/types/explore';

interface CareerDrawerProps {
  careerId: string;
  onClose: () => void;
}

const CareerDrawer: React.FC<CareerDrawerProps> = ({ careerId, onClose }) => {
  const navigate = useNavigate();
  const { data, loading, error } = useData<CareerDetail>(`data/explore/careers_detail/${careerId}.json`);
  const relatedMajor = useMemo(() => data?.relatedMajors?.[0] ?? '', [data]);
  const friendlyError = useMemo(() => {
    if (!error) return null;
    if (error.includes('HTTP 404')) {
      return '暂无该职业的详细信息';
    }
    return error;
  }, [error]);
  const isMissingDetail = friendlyError === '暂无该职业的详细信息';

  if (!careerId) return null;

  // Use Portal to break out of the "MainLayout" stacking context
  // This ensures the Drawer covers the fixed Navigation Dock (z-40) and Header
  return createPortal(
    <>
      {/* Backdrop - Z-100 ensures it sits on top of everything */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Drawer Panel - Z-110 */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 right-0 z-[110] w-full md:w-[600px] bg-[#FDFCF8] shadow-2xl flex flex-col"
      >
         {/* Texture Overlay for Paper Feel */}
         <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pointer-events-none z-0" />

         {/* --- Header --- */}
         <div className="relative z-10 p-8 border-b border-slate-200/60 bg-white/50 backdrop-blur-md flex justify-between items-start shrink-0">
             <div>
                 <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                     {data?.category ? `${data.category} 职业档案` : '职业档案'}
                 </span>
                 <h2 className="text-3xl font-serif font-black text-[#0A2463] mb-2">{data?.title || '加载中'}</h2>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">{data?.definition || '正在加载职业详情...'}</p>
             </div>
             <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                 <X className="w-6 h-6" />
             </button>
         </div>

         {/* --- Scroll Content --- */}
         <div className="relative z-10 flex-1 overflow-y-auto p-8 space-y-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A2463]" />
                <span className="text-xs font-bold uppercase tracking-widest">正在加载职业详情...</span>
              </div>
            ) : friendlyError ? (
              <div className="py-20 text-center">
                <p className={`text-sm font-bold ${isMissingDetail ? 'text-slate-500' : 'text-rose-500'}`}>
                  {isMissingDetail ? '详情正在补齐' : '职业详情加载失败'}
                </p>
                <p className={`text-xs mt-2 ${isMissingDetail ? 'text-slate-400' : 'text-rose-400'}`}>
                  {friendlyError}
                </p>
              </div>
            ) : data ? (
              <>
                {/* 1. Reality Check (Typical Day) */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2463]">典型一天</h3>
                    </div>
                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                        {data.typicalDay.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-white border-2 border-slate-300 rounded-full" />
                                <span className="text-xs font-bold text-slate-400 block mb-1">{item.time}</span>
                                <p className="text-sm font-medium text-slate-700">{item.task}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Skills Matrix */}
                <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BrainCircuit className="w-5 h-5 text-[#3E92CC]" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2463]">能力矩阵</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 pb-2">硬技能</h4>
                            <ul className="space-y-2">
                                {data.coreSkills.hard.map(s => <li key={s} className="text-sm font-bold text-slate-700">• {s}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 border-b border-slate-100 pb-2">软技能</h4>
                            <ul className="space-y-2">
                                {data.coreSkills.soft.map(s => <li key={s} className="text-sm font-bold text-slate-700">• {s}</li>)}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Fit vs Unfit */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-3">适合的人</h3>
                        <ul className="space-y-2">
                            {data.fit.map((item) => (
                                <li key={item} className="text-sm font-medium text-emerald-800/90 flex gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-rose-700 mb-3">不太适合</h3>
                        <ul className="space-y-2">
                            {data.unfit.map((item) => (
                                <li key={item} className="text-sm font-medium text-rose-800/90 flex gap-2">
                                    <span className="text-rose-500 font-bold">×</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* 4. Myths (Warning) */}
                <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-sm font-black uppercase tracking-widest">常见误区</h3>
                    </div>
                    <ul className="space-y-2">
                        {data.myths.map((m, i) => (
                            <li key={i} className="text-sm font-medium text-amber-900/80 flex gap-2">
                                <span className="text-amber-500 font-bold">×</span> {m}
                            </li>
                        ))}
                    </ul>
                </section>
                
                {/* 5. Career Path */}
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">成长路径</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {data.path.map((step, i) => (
                            <React.Fragment key={step}>
                                <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">{step}</span>
                                {i < data.path.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                {/* 6. Related Majors */}
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">相关专业</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.relatedMajors.map((major) => (
                            <span key={major} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold shadow-sm">
                                {major}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 7. Learning Path */}
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">入门学习路径</h3>
                    <div className="space-y-2">
                        {data.learningPath.map((step, idx) => (
                            <div key={step} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold flex items-center justify-center">
                                    {idx + 1}
                                </span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </section>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <p className="text-sm font-bold">暂无该职业的详细信息</p>
              </div>
            )}

         </div>

         {/* --- Footer Actions --- */}
         <div className="relative z-10 p-6 border-t border-slate-200 bg-white flex gap-4 shrink-0">
             <button className="flex-1 py-4 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                 <Heart className="w-4 h-4" />
                 收藏
             </button>
             <button 
                onClick={() => navigate(`/admissions?search=${encodeURIComponent(relatedMajor || data?.title || '')}`)}
                className="flex-[2] py-4 rounded-xl bg-[#0A2463] text-white font-bold hover:bg-amber-600 flex items-center justify-center gap-2 shadow-lg shadow-[#0A2463]/20 transition-all"
            >
                 <BookOpen className="w-4 h-4" />
                 查看相关专业
             </button>
         </div>

      </motion.div>
    </>,
    document.body
  );
};

export default CareerDrawer;
