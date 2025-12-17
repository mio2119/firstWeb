import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { ResonantCareer } from '../../hooks/useExplore';

interface CareerGridProps {
  careers: ResonantCareer[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedTag: string;
  setSelectedTag: (val: string) => void;
  categories: string[];
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onReset: () => void;
}

const CareerGrid: React.FC<CareerGridProps> = ({ 
  careers,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
  categories,
  loading,
  error,
  onSelect,
  onReset
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
        
        {/* --- Control Console (Filter Bar) --- */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-20 z-30 mb-8"
        >
             <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgba(10,36,99,0.08)] rounded-2xl p-2 flex flex-col md:flex-row items-center gap-3">
                 {/* Search */}
                 <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="搜索关键词或职业方向..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 bg-transparent outline-none text-sm font-bold text-slate-700 placeholder-slate-400"
                    />
                 </div>
                 <div className="hidden md:block w-px h-8 bg-slate-200" />
                 {/* Categories */}
                 <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedTag(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${selectedTag === cat ? 'bg-[#0A2463] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                 </div>
                 {/* Reset */}
                 <button onClick={onReset} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">
                    重置
                 </button>
             </div>
        </motion.div>

        {/* --- Matrix Grid --- */}
        {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#0A2463]" />
                <span className="text-xs font-bold uppercase tracking-widest">正在加载职业图谱...</span>
            </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-rose-500 gap-2">
                <span className="text-sm font-bold">职业索引加载失败</span>
                <span className="text-xs text-rose-400">{error}</span>
            </div>
        ) : careers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                <span className="text-sm font-bold">暂无匹配职业</span>
                <span className="text-xs">试试调整关键词或筛选条件</span>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                  {careers.map((career) => (
                      <motion.div
                          key={career.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => onSelect(career.id)}
                          className={`
                              group relative p-6 rounded-[2rem] border cursor-pointer overflow-hidden transition-all duration-300
                              ${career.matchScore >= 70 
                                  ? 'bg-gradient-to-br from-white/80 to-amber-50/50 border-amber-200/60 shadow-[0_10px_30px_rgba(245,158,11,0.1)]' 
                                  : 'bg-white/60 border-white/50 shadow-sm'}
                              hover:-translate-y-1 hover:shadow-xl
                          `}
                      >
                          {/* Resonance Badge */}
                          {career.matchScore >= 70 && career.matchReason && (
                              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 border border-amber-200/50 text-amber-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                  <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{career.matchReason}</span>
                              </div>
                          )}

                          <div className="mb-8">
                               <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-[#0A2463] group-hover:bg-[#0A2463] group-hover:text-white transition-colors">
                                   <Briefcase className="w-6 h-6" />
                               </div>
                               <h3 className="text-xl font-black text-[#0A2463] mb-1">{career.title}</h3>
                               <p className="text-sm font-medium text-slate-500 line-clamp-2">{career.shortDesc}</p>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/50">
                              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{career.category}</span>
                              <div className="flex items-center gap-1 text-xs font-bold text-[#0A2463] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                                  <span>查看</span>
                                  <ArrowRight className="w-3 h-3" />
                              </div>
                          </div>

                      </motion.div>
                  ))}
              </AnimatePresence>
          </div>
        )}
    </div>
  );
};

export default CareerGrid;
