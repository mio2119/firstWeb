import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Quote, Minus, Plus, Circle } from 'lucide-react';
import MBTIBackground from '../components/layout/MBTIBackground.tsx';
import { useData } from '../hooks/useData.ts';
import { useMBTI } from '../hooks/useMBTI.ts';
import type { MBTIQuestion } from '../data/types/quiz';
import { useUser } from '../context/UserContext.tsx';

const SCALE_OPTIONS = [
  { value: 1, label: '非常不同意', icon: X, tone: 'muted' },
  { value: 2, label: '不同意', icon: Minus, tone: 'muted' },
  { value: 3, label: '中立', icon: Circle, tone: 'neutral' },
  { value: 4, label: '同意', icon: Plus, tone: 'strong' },
  { value: 5, label: '非常同意', icon: Check, tone: 'strong' }
] as const;
const EMPTY_QUESTIONS: MBTIQuestion[] = [];

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { setMBTI } = useUser();
  const { data: questions, loading, error } = useData<MBTIQuestion[]>('data/quiz/mbti_questions.json');
  const quizQuestions = questions ?? EMPTY_QUESTIONS;
  const {
    currentIndex,
    currentQuestion,
    progress,
    direction,
    total,
    answerQuestion,
    resultType
  } = useMBTI(quizQuestions);

  useEffect(() => {
    if (!resultType) return;
    setMBTI({ type: resultType, timestamp: Date.now(), resultId: resultType });
    navigate('/result');
  }, [resultType, navigate, setMBTI]);

  // Card Animation Variants
  const cardVariants = {
    initial: { scale: 0.95, y: 30, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: (custom: number) => ({
      x: custom * 300, 
      opacity: 0,
      rotate: custom * 10,
      transition: { duration: 0.4, ease: "easeInOut" }
    })
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans text-slate-900">
      <MBTIBackground />
      
      {/* Content Layer (z-10 to sit above background) */}
      <div className="relative z-10 w-full max-w-xl px-4 flex flex-col items-center min-h-screen justify-center py-10">
        {loading && (
          <div className="text-center text-slate-600 font-medium">正在加载题库，请稍候…</div>
        )}
        {!loading && error && (
          <div className="text-center text-rose-600 font-medium">{error}</div>
        )}
        {!loading && !error && (!questions || questions.length === 0) && (
          <div className="text-center text-slate-600 font-medium">题库暂不可用，请稍后再试。</div>
        )}
        {!loading && !error && currentQuestion && (
        <>
        {/* --- Header & Progress --- */}
        <div className="w-full max-w-md mb-8">
            <div className="flex justify-between items-end mb-3 px-1">
                <span className="text-xs font-bold text-amber-600 tracking-[0.2em] uppercase">
                    题目 {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}
                </span>
                <span className="text-xs font-bold text-slate-400 tracking-widest">
                    {total < 10 ? `0${total}` : total}
                </span>
            </div>
            
            {/* Progress Track */}
            <div className="h-1 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-slate-800"
                    {...({
                      initial: { width: 0 },
                      animate: { width: `${progress}%` },
                      transition: { duration: 0.5, ease: "circOut" }
                    } as any)}
                />
            </div>
        </div>

        {/* --- The Frosted Glass Card --- */}
        <div className="relative w-full h-[400px] flex items-center justify-center perspective-1000">
            <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                    key={currentQuestion.id}
                    {...({
                      custom: direction,
                      variants: cardVariants,
                      initial: "initial",
                      animate: "animate",
                      exit: "exit",
                      transition: { type: "spring", stiffness: 300, damping: 25 }
                    } as any)}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 py-12 rounded-[2.5rem]
                               bg-white/70 backdrop-blur-lg border border-white/50
                               shadow-[0_20px_50px_-10px_rgba(10,36,99,0.1)]"
                >
                    {/* Icon Decoration */}
                    <div className="mb-6 p-4 rounded-full bg-amber-50/50 text-amber-600">
                        <Quote className="w-6 h-6 fill-current" />
                    </div>

                    {/* Question Text */}
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-tight mb-8 max-w-sm drop-shadow-sm">
                        {currentQuestion.text}
                    </h2>

                    {/* Metadata Tag */}
                    <div className="mt-auto">
                        <span className="inline-block px-4 py-1.5 rounded-full border border-slate-200/50 bg-white/40 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                            维度: <span className="text-amber-600 ml-1">{currentQuestion.dimension}</span>
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        {/* --- Controls --- */}
        <div className="mt-12 flex items-center gap-4 md:gap-6 z-20 flex-wrap justify-center">
          {SCALE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isStrong = option.tone === 'strong';
            return (
              <button
                key={option.value}
                onClick={() => answerQuestion(option.value)}
                className="group flex flex-col items-center gap-3 outline-none"
                aria-label={option.label}
              >
                <div
                  className={`w-16 h-16 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95
                    ${isStrong ? 'bg-[#0A2463] border-[#0A2463] shadow-xl shadow-[#0A2463]/20 group-hover:bg-amber-600 group-hover:border-amber-600 group-hover:shadow-amber-600/30' : 'bg-white/80 border-white shadow-lg group-hover:border-slate-300'}`}
                >
                  <Icon className={`w-6 h-6 ${isStrong ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isStrong ? 'text-[#0A2463] group-hover:text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default Quiz;
