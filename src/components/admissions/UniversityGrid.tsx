import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, ArrowUpRight, GraduationCap } from 'lucide-react';
import AddToPlanButton from './AddToPlanButton.tsx';
import type { UniversityIndexItem } from '../../data/types/admissions';

interface UniversityGridProps {
  universities: UniversityIndexItem[];
  onSelect: (uni: UniversityIndexItem) => void;
}

const UniversityGrid: React.FC<UniversityGridProps> = ({ universities, onSelect }) => {
  return (
    <motion.div 
      {...({ layout: true } as any)}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
    >
      <AnimatePresence mode="popLayout">
        {universities.map((uni, index) => (
          <UniversityCard key={uni.id} uni={uni} index={index} onClick={() => onSelect(uni)} />
        ))}
      </AnimatePresence>
      
      {universities.length === 0 && (
          <motion.div 
            {...({ initial: { opacity: 0 }, animate: { opacity: 1 } } as any)}
            className="col-span-full py-20 text-center"
          >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-serif text-lg">未找到匹配的院校，请调整筛选条件。</p>
          </motion.div>
      )}
    </motion.div>
  );
};

interface UniversityCardProps {
  uni: UniversityIndexItem;
  index: number;
  onClick: () => void;
}

const UniversityCard: React.FC<UniversityCardProps> = ({ uni, index, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      {...({
        layout: true,
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.4, delay: index * 0.05 },
        whileHover: { y: -8 }
      } as any)}
      className="group relative bg-white/60 backdrop-blur-md border border-white/80 rounded-[1.5rem] p-6 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(217,119,6,0.15)] hover:border-amber-400/30 transition-all duration-300 cursor-pointer overflow-visible"
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/0 to-amber-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.5rem]" />

      {/* --- Top: Identity --- */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#0A2463] font-serif font-black text-2xl group-hover:scale-105 transition-transform duration-300">
            {uni.logo_char}
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#0A2463] leading-tight mb-1 group-hover:text-amber-700 transition-colors">
              {uni.name_cn}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{uni.name.split(' ')[0]}</p>
          </div>
        </div>
        
        {/* Ranking Badge (Top Right) */}
        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[#0A2463]/5 border border-[#0A2463]/10 text-[#0A2463] group-hover:bg-[#0A2463] group-hover:text-white transition-colors duration-300">
           <span className="text-[10px] font-bold uppercase">No.</span>
           <span className="text-sm font-black font-mono leading-none">{uni.ranking}</span>
        </div>
      </div>

      {/* --- Middle: Badges --- */}
      <div className="flex flex-wrap gap-2 mb-8 relative z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {uni.province}
        </span>
        {uni.tags.map(tag => {
            const isGold = tag === '985' || tag === 'Double First-Class';
            return (
                <span 
                    key={tag} 
                    className={`
                        px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                        ${isGold 
                            ? 'bg-amber-50 border-amber-200 text-amber-700' 
                            : 'bg-white border-slate-200 text-slate-500'}
                    `}
                >
                    {tag}
                </span>
            );
        })}
      </div>

      {/* --- Bottom: Action --- */}
      <div className="flex items-center justify-between border-t border-slate-200/60 pt-4 relative z-10">
        <div className="flex items-center gap-2 text-slate-400 group-hover:text-amber-600 transition-colors">
            <Trophy className="w-3 h-3" />
            <span className="text-xs font-medium">World Rank: Top 100</span>
        </div>
        
        {/* The Add Button - stops propagation to prevent opening details when clicked */}
        <div onClick={(e) => e.stopPropagation()}>
            <AddToPlanButton university={uni} className="scale-90 origin-right" />
        </div>
      </div>

    </motion.div>
  );
};

export default UniversityGrid;
