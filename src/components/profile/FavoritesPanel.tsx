import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, BookOpen, Trash2, ArrowUpRight } from 'lucide-react';
import { useUser, FavoriteItem } from '../../context/UserContext';

const FavoritesPanel: React.FC = () => {
  const { favorites, toggleFavorite } = useUser();
  const navigate = useNavigate();

  // Sort by newest first
  const sortedItems = [...favorites].sort((a, b) => b.timestamp - a.timestamp);

  const TypeIcon = {
    university: GraduationCap,
    career: Briefcase,
    major: BookOpen
  };

  return (
    <div className="w-full">
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
            {sortedItems.map((item, idx) => {
              const Icon = TypeIcon[item.type];
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#FDFBF7] p-6 shadow-[2px_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[5px_10px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out cursor-default"
                >
                  {/* Visual: Tape/Pin at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/40 backdrop-blur-sm border-l border-r border-white/50 rotate-[-1deg] shadow-sm pointer-events-none" />

                  <div className="flex items-start justify-between mb-6">
                    {/* Stamp Icon */}
                    <div className={`w-14 h-14 rounded-full border-2 border-double flex items-center justify-center shrink-0 ${
                       item.type === 'university' ? 'border-indigo-200 text-indigo-800 bg-indigo-50/30' :
                       item.type === 'career' ? 'border-amber-200 text-amber-800 bg-amber-50/30' :
                       'border-emerald-200 text-emerald-800 bg-emerald-50/30'
                    }`}>
                       <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => navigate(item.path)}
                            className="p-2 hover:bg-stone-100 rounded-full text-stone-500"
                        >
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => toggleFavorite(item)}
                            className="p-2 hover:bg-rose-50 rounded-full text-stone-400 hover:text-rose-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>

                  <div>
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block">
                        {item.type}
                     </span>
                     <h3 className="text-xl font-serif font-bold text-slate-800 mb-2 leading-tight">
                        {item.title}
                     </h3>
                     {item.subtitle && (
                         <p className="text-sm font-medium text-slate-500 italic border-t border-slate-100 pt-3 mt-3">
                             {item.subtitle}
                         </p>
                     )}
                  </div>

                  {/* Visual: Date Stamp */}
                  <div className="absolute bottom-4 right-4 opacity-10 font-mono text-[10px] -rotate-12 pointer-events-none">
                     {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        // Empty State: The Blank Page
        <div className="w-full py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/30">
            <div className="w-16 h-16 mb-4 opacity-20 bg-[url('https://cdn-icons-png.flaticon.com/512/29/29302.png')] bg-contain bg-no-repeat bg-center grayscale" />
            <h3 className="text-lg font-serif font-bold text-slate-400 mb-2">The pages are blank.</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Explore the world and collect fragments of your future here.
            </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPanel;