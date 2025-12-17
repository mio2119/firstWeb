import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Search } from 'lucide-react';

interface ScoreHeroProps {
  onSearch: (score: number) => void;
}

const ScoreHero: React.FC<ScoreHeroProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers, max 3 digits
    if (/^\d{0,3}$/.test(val)) {
      if (parseInt(val) > 750) return;
      setInputValue(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length > 0) {
      onSearch(parseInt(inputValue));
    }
  };

  return (
    <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center p-6">
      
      {/* --- Ambient Background Glow (Amber) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        {...({
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: "easeOut" }
        } as any)}
        className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center"
      >
        {/* --- Header --- */}
        <div className="mb-10">
            <motion.div 
                {...({
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  transition: { delay: 0.3 }
                } as any)}
                className="flex items-center justify-center gap-2 mb-4"
            >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Smart Enroll Intelligent System
                </span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-serif font-black text-[#0A2463] mb-4 tracking-tight leading-tight">
                探索您的未来学府
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto leading-relaxed font-sans">
                基于大数据分析与 AI 洞察，<br className="md:hidden"/>精准匹配您的志愿目标。
            </p>
        </div>

        {/* --- The Digital Altar (Input) --- */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            
            <div className="flex flex-col items-center gap-2 mb-2">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    输入高考 / 模考预估分
                 </label>
            </div>

            <div className="relative group mb-12">
                {/* Input Field */}
                <input 
                    type="text" 
                    inputMode="numeric"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="000"
                    className="w-full max-w-[400px] bg-transparent text-center text-8xl md:text-9xl font-mono font-bold text-[#0A2463] placeholder-slate-200 outline-none pb-4 transition-all duration-300 selection:bg-amber-100 selection:text-amber-900"
                />
                
                {/* Animated Underline */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-[3px] bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-amber-50 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                        {...({
                          initial: { width: "0%" },
                          animate: { width: isFocused || inputValue ? "100%" : "0%" },
                          transition: { duration: 0.4, ease: "easeInOut" }
                        } as any)}
                    />
                </div>

                {/* '分' Unit Label */}
                <div className="absolute top-1/2 right-4 md:-right-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
                    <span className="text-xl font-serif font-bold text-slate-300 block origin-center">
                        分
                    </span>
                </div>
            </div>

            {/* --- Action Button --- */}
            <motion.button 
                {...({
                  whileHover: { scale: 1.05 },
                  whileTap: { scale: 0.95 }
                } as any)}
                disabled={!inputValue}
                className={`
                    group relative px-12 py-5 rounded-full flex items-center gap-3 shadow-xl transition-all duration-500
                    ${inputValue 
                        ? 'bg-[#0A2463] text-white shadow-[#0A2463]/30 hover:bg-[#0A2463] hover:shadow-amber-500/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
            >
                <div className="absolute inset-0 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <span className="font-serif font-bold tracking-widest text-lg">
                    开始检索
                </span>
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${inputValue ? 'bg-amber-500 text-white' : 'bg-slate-300 text-white'}
                `}>
                    <Search className={`w-4 h-4 ${inputValue ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                </div>
            </motion.button>
        </form>

      </motion.div>
    </div>
  );
};

export default ScoreHero;