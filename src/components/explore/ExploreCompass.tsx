import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Database,
  PenTool,
  Box,
  Shield,
  Coins,
  Plane,
  Zap,
  Clock,
  Hourglass,
  Sparkles
} from 'lucide-react';
import { GuidePrefs } from '../../hooks/useExplore';
import { useData } from '../../hooks/useData';

interface ExploreCompassProps {
  onComplete: (prefs: GuidePrefs) => void;
}

interface GuideOption {
  label: string;
  tag: string;
  icon: string;
  desc: string;
}

interface GuideQuestion {
  id: keyof GuidePrefs;
  title: string;
  options: GuideOption[];
}

interface GuidePayload {
  questions: GuideQuestion[];
}

const iconMap: Record<string, React.ElementType> = {
  Users,
  Database,
  PenTool,
  Box,
  Shield,
  Coins,
  Plane,
  Zap,
  Clock,
  Hourglass
};

const ExploreCompass: React.FC<ExploreCompassProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<GuidePrefs>({ activity: null, value: null, investment: null });
  const { data: guideData, loading, error } = useData<GuidePayload>('data/explore/guide_questions.json');

  const questions = useMemo(() => guideData?.questions ?? [], [guideData]);

  const handleSelect = (key: keyof GuidePrefs, value: string) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onComplete(newPrefs);
    }
  };

  const currentQ = questions[step];

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[500px] flex items-center justify-center">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-2xl shadow-slate-200/50 -z-10 transform rotate-1" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] shadow-sm -z-20 transform -rotate-1" />

      <div className="w-full p-8 md:p-12 text-center">
        {loading ? (
          <div className="py-16 text-slate-400">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-500" />
              正在加载引导问题
            </div>
          </div>
        ) : error || !currentQ ? (
          <div className="py-16 text-rose-500">
            <p className="text-sm font-bold">引导加载失败</p>
            <p className="text-xs text-rose-400 mt-2">{error || '暂无引导问题数据'}</p>
          </div>
        ) : (
          <>
            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
                {questions.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-amber-500' : 'w-2 bg-slate-200'}`} 
                    />
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className="text-3xl font-serif font-black text-[#0A2463] mb-8">{currentQ.title}</h2>
                    
                    <div className={`grid gap-4 ${currentQ.id === 'investment' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'}`}>
                        {currentQ.options.map((opt) => {
                          const Icon = iconMap[opt.icon] || Sparkles;
                          return (
                            <button
                                key={opt.tag}
                                onClick={() => handleSelect(currentQ.id, opt.tag)}
                                className="group relative flex flex-col items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-amber-400 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] transition-all duration-300 text-left"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                    <Icon className="w-6 h-6 text-slate-500 group-hover:text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-700">{opt.label}</h3>
                                <p className="text-xs text-slate-400 font-medium mt-1 leading-tight">{opt.desc}</p>
                            </button>
                          );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default ExploreCompass;
