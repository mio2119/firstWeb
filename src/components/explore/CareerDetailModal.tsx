import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, TrendingUp, Map, Code2, ArrowRight, Zap, Briefcase } from 'lucide-react';
import { ExploreItem } from '../../data/explore/mock_matrix_data';

interface CareerDetailModalProps {
  career: ExploreItem;
  onClose: () => void;
}

const CareerDetailModal: React.FC<CareerDetailModalProps> = ({ career, onClose }) => {
  const navigate = useNavigate();

  const handleNavigateToAdmissions = () => {
    // Navigate with query param for auto-search
    navigate(`/admissions?search=${encodeURIComponent(career.linkedMajorKeyword || career.title)}`);
  };

  return (
    <>
      {/* --- Backdrop --- */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md"
      />

      {/* --- Holographic Modal --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4"
      >
        <div className="pointer-events-auto relative w-full max-w-2xl bg-slate-900/90 border border-amber-500/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] rounded-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors z-20"
            >
                <X className="w-5 h-5" />
            </button>

            {/* --- Left: Identity & Stats --- */}
            <div className="md:w-5/12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 flex flex-col relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-24 bg-amber-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 mb-6">
                        <Briefcase className="w-7 h-7" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-2">{career.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {career.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-auto space-y-6">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">平均薪资</p>
                            <p className="text-xl font-mono font-bold text-amber-400">{career.salary}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">行业趋势</p>
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                                <TrendingUp className="w-4 h-4" />
                                {career.growth}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Right: Roadmap & Skills --- */}
            <div className="md:w-7/12 p-8 bg-slate-950/50 flex flex-col">
                
                {/* Skills */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 text-amber-500/80">
                        <Code2 className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">核心技能树</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                         {career.skills?.map(skill => (
                             <span key={skill} className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                                 {skill}
                             </span>
                         ))}
                    </div>
                </div>

                {/* Roadmap */}
                <div className="mb-8 flex-1">
                    <div className="flex items-center gap-2 mb-4 text-amber-500/80">
                        <Map className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">职业晋升路线</h3>
                    </div>
                    <div className="relative pl-4 border-l border-slate-800 space-y-6">
                        {career.roadmap?.map((step, idx) => (
                            <div key={idx} className="relative">
                                {/* Dot */}
                                <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${idx === career.roadmap!.length - 1 ? 'bg-amber-500 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-900 border-slate-600'}`} />
                                <span className={`text-sm font-bold ${idx === career.roadmap!.length - 1 ? 'text-white' : 'text-slate-500'}`}>
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action */}
                <button 
                    onClick={handleNavigateToAdmissions}
                    className="group w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_30px_rgba(217,119,6,0.4)]"
                >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>查看相关专业院校</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

        </div>
      </motion.div>
    </>
  );
};

export default CareerDetailModal;