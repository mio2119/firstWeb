import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { MessageSquare, ArrowUpRight } from 'lucide-react';

const HistoryPanel: React.FC = () => {
  const { history } = useUser();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // If empty
  if (history.length === 0) {
    return (
        <div className="py-20 text-center border-l-2 border-stone-200 ml-6 pl-8">
            <p className="font-serif italic text-slate-400 text-lg">"The road not taken is waiting..."</p>
            <p className="text-xs text-slate-300 mt-4 uppercase tracking-widest">Start your journey</p>
        </div>
    );
  }

  return (
    <div ref={containerRef} className="relative pl-6 md:pl-12 py-8">
      
      {/* --- The Winding Path (SVG) --- */}
      <div className="absolute left-0 top-0 bottom-0 w-8 overflow-hidden pointer-events-none">
          <svg className="h-full w-full" preserveAspectRatio="none">
              {/* Dashed Guide Line */}
              <motion.path 
                  d={`M 4,0 V ${history.length * 120 + 100}`}
                  fill="none"
                  stroke="#E5E7EB" 
                  strokeWidth="2"
                  strokeDasharray="4 4"
              />
              {/* Animated Ink Line (Using Framer Motion view-based animation per segment could be complex, simple stroke animation here) */}
              <motion.path 
                  d={`M 4,0 V ${history.length * 120 + 100}`}
                  fill="none"
                  stroke="#D97706" // Amber-600
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  viewport={{ once: true }}
              />
          </svg>
      </div>

      <div className="space-y-12">
        {history.map((item, idx) => (
            <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative"
            >
                {/* Milestone Dot */}
                <div className="absolute -left-[30px] md:-left-[54px] top-1 w-4 h-4 bg-[#F9F7F2] border-2 border-stone-800 rounded-full flex items-center justify-center z-10">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'qa' ? 'bg-amber-500' : 'bg-stone-800'}`} />
                </div>

                {/* Content Card */}
                <div 
                    onClick={() => item.path && navigate(item.path)}
                    className={`
                        group relative p-6 bg-white border border-stone-100 shadow-sm rounded-lg cursor-pointer transition-all duration-300
                        hover:shadow-md hover:-translate-y-1 hover:border-amber-200
                        ${item.path ? '' : 'cursor-default'}
                    `}
                >
                    {/* Date Label */}
                    <div className="absolute -top-3 left-6 px-2 bg-[#F9F7F2] text-xs font-mono font-bold text-stone-400">
                        {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>

                    <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-lg text-stone-800 group-hover:text-amber-700 transition-colors mb-2">
                            {item.title}
                        </h4>
                        {item.path && <ArrowUpRight className="w-4 h-4 text-stone-300 group-hover:text-amber-500" />}
                    </div>

                    {item.content && (
                        <div className="text-sm text-stone-600 italic leading-relaxed pl-3 border-l-2 border-amber-200 bg-amber-50/30 p-2 rounded-r-md">
                            "{item.content}"
                        </div>
                    )}
                </div>
            </motion.div>
        ))}
      </div>
      
      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F9F7F2] to-transparent pointer-events-none z-20" />
    </div>
  );
};

export default HistoryPanel;