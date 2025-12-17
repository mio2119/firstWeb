import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Sparkles, ArrowRight, GraduationCap, Radar, Compass, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface UniversitySummary {
  id: string;
  name: string;
  tags: string[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [hotUniversities, setHotUniversities] = useState<UniversitySummary[]>([]);
  
  const PLACEHOLDERS = [
    "输入你的 MBTI 类型...",
    "查询 2024 北大录取线...",
    "计算机科学专业排名...",
    "我适合学法学吗？"
  ];

  // Rotate Search Placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Simulate Data Fetching
  useEffect(() => {
    fetch('data/admissions/index_universities.json')
      .then(res => {
          if(!res.ok) throw new Error("Failed to fetch");
          return res.json();
      })
      .then(data => {
        setHotUniversities(data.slice(0, 4));
      })
      .catch(() => {
        setHotUniversities([
            { id: "u1", name: "清华大学", tags: ["TOP1", "理工"] },
            { id: "u2", name: "复旦大学", tags: ["综合", "人文"] }
        ]);
      });
  }, []);

  const MODULES = [
    { 
      id: 'admissions', 
      title: '院校志愿', 
      subtitle: '基于权威数据的录取概率分析', 
      icon: GraduationCap, 
      path: '/admissions',
      tag: '核心',
      isHot: false
    },
    { 
      id: 'assessment', 
      title: '性格测评', 
      subtitle: 'MBTI 职业潜能与优势解析', 
      icon: Radar, 
      path: '/quiz', 
      tag: '热门',
      isHot: true
    },
    { 
      id: 'explore', 
      title: '生涯探索', 
      subtitle: '发现未来的无限发展赛道', 
      icon: Compass, 
      path: '/explore',
      isHot: false
    },
    { 
      id: 'qa', 
      title: 'AI 顾问', 
      subtitle: '7x24h 智能升学规划专家', 
      icon: Bot, 
      path: '/qa',
      tag: 'Beta',
      isHot: false
    }
  ];

  return (
    <div className="relative w-full pb-10 font-sans text-slate-900">
      
      {/* --- Hero Section (Classic Prestige) --- */}
      <section className="relative z-10 pt-10 mb-20 text-center md:text-left">
        <motion.div
            {...({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, ease: "easeOut" }
            } as any)}
        >
            <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4">Future Academy Intelligence</h2>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
            规划你的<br />
            <span className="text-slate-900 relative inline-block">
                卓越未来
                {/* Underline Decoration */}
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-amber-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
            </span>
            </h1>
        </motion.div>
        
        {/* --- Search Capsule (Solid Paper Style) --- */}
        <motion.div 
            {...({
              initial: { opacity: 0, scale: 0.98 },
              animate: { opacity: 1, scale: 1 },
              transition: { delay: 0.2, duration: 0.6 }
            } as any)}
            className="group relative max-w-2xl mx-auto md:mx-0"
        >
            {/* Soft Shadow */}
            <div className="absolute inset-2 bg-slate-200 blur-xl rounded-full opacity-50" />
            
            {/* Input Container */}
            <div className="relative flex items-center bg-white h-16 rounded-full border border-slate-200 shadow-xl shadow-slate-200/50 px-2 transition-all duration-300 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/20">
                <div className="pl-6 pr-4 text-slate-400">
                    <Search className="w-5 h-5" strokeWidth={2} />
                </div>
                <input 
                    type="text" 
                    className="flex-1 h-full bg-transparent outline-none text-lg text-slate-800 placeholder-slate-400 font-medium"
                    placeholder={PLACEHOLDERS[placeholderIndex]}
                />
                <button className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 transition-all duration-300 hover:bg-amber-700 hover:scale-105 active:scale-95">
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </button>
            </div>
        </motion.div>

        {/* --- Trending Tags (Clean Pills) --- */}
        <motion.div 
            {...({
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.4 }
            } as any)}
            className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3"
        >
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mr-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Trending
            </div>
            {hotUniversities.map((uni) => (
                <button 
                    key={uni.id} 
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200"
                >
                    {uni.name}
                </button>
            ))}
        </motion.div>
      </section>

      {/* --- Feature Grid (Clean Paper Cards) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {MODULES.map((module, idx) => (
            <motion.div
                key={module.id}
                {...({
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { delay: idx * 0.1, duration: 0.5 }
                } as any)}
                onClick={() => navigate(module.path)}
                className="group relative cursor-pointer"
            >
                <div className="h-full p-8 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:shadow-slate-200/50 group-hover:border-amber-400 group-hover:-translate-y-1 relative overflow-hidden">
                    
                    {/* Hover Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${module.isHot ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'} group-hover:bg-slate-900 group-hover:text-white`}>
                            <module.icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        {module.tag && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${module.id === 'assessment' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {module.tag}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2 font-serif group-hover:text-amber-700 transition-colors">
                        {module.title}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-slate-600">
                        {module.subtitle}
                    </p>

                    {/* Arrow appearing on hover */}
                    <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
            </motion.div>
        ))}
      </section>

      {/* --- Status Widget (Clean Card) --- */}
      <motion.section 
        {...({
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          transition: { duration: 0.6 }
        } as any)}
        className="relative bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6"
      >
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                <MapPin className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Location</h4>
                <p className="text-xl font-serif font-bold text-slate-900">广东 · 广州</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-slate-100" />

          <div className="text-right">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days Until Exam</h4>
              <p className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
                156 <span className="text-sm font-sans font-bold text-amber-600 ml-1">Days</span>
              </p>
          </div>
      </motion.section>

    </div>
  );
};

export default Home;
