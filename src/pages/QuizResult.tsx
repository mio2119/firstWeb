import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { 
  BrainCircuit, 
  TrendingUp, 
  Scale, 
  Globe, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Award
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout.tsx';
import MagneticButton from '../components/common/MagneticButton.tsx';
import TiltCard from '../components/visuals/TiltCard.tsx';
import { useData } from '../hooks/useData.ts';
import { useUser } from '../context/UserContext.tsx';
import type { MBTIMapping } from '../data/types/quiz';

// --- Register ChartJS Components ---
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// --- Career Icon Mapping ---
const CAREER_ICONS: Record<string, React.ElementType> = {
  "人工智能": BrainCircuit,
  "金融工程": TrendingUp,
  "法学": Scale,
  "国际关系": Globe
};

const QuizResult: React.FC = () => {
  const navigate = useNavigate();
  const { mbti } = useUser();
  const { data: mapping, loading, error } = useData<MBTIMapping>('data/quiz/mapping.json');
  const resultType = mbti?.type;
  const result = resultType && mapping ? mapping[resultType] : null;
  const radar = result?.radar || { labels: [], data: [] };

  // --- Chart Configuration ---
  const chartData: ChartData<'radar'> = {
    labels: radar.labels,
    datasets: [
      {
        label: result?.type || 'MBTI',
        data: radar.data,
        backgroundColor: 'rgba(217, 242, 70, 0.4)', // Acid Lime #D9F246 with opacity
        borderColor: '#0A2463', // Electric Navy
        borderWidth: 2,
        pointBackgroundColor: '#0A2463',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0A2463',
      },
    ],
  };

  const chartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          display: false,
        },
        grid: {
          color: 'rgba(10, 36, 99, 0.1)', // Subtle Navy grid
          circular: true,
        },
        angleLines: {
          color: 'rgba(10, 36, 99, 0.1)',
        },
        pointLabels: {
          font: {
            family: "'Times New Roman', serif",
            size: 12,
            weight: 'bold',
          },
          color: '#0A2463',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <MainLayout activeTab="quiz">
      <div className="w-full">
        {loading && (
          <div className="text-center text-slate-600 font-medium py-16">正在加载测评结果…</div>
        )}
        {!loading && error && (
          <div className="text-center text-rose-600 font-medium py-16">{error}</div>
        )}
        {!loading && !error && !resultType && (
          <div className="text-center text-slate-600 font-medium py-16">
            还没有测评结果，先去完成测评吧。
            <div className="mt-6 flex justify-center">
              <MagneticButton onClick={() => navigate('/quiz')} className="!bg-[#0A2463] !text-white">
                <span>开始测评</span>
              </MagneticButton>
            </div>
          </div>
        )}
        {!loading && !error && resultType && !result && (
          <div className="text-center text-slate-600 font-medium py-16">未找到对应的测评结果，请重新测评。</div>
        )}
        {!loading && !error && result && (
        <>
        {/* --- Header Section --- */}
        <motion.div 
            {...({
              initial: { opacity: 0, y: -20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8 }
            } as any)}
            className="text-center mb-10"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-sm backdrop-blur-md mb-4">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-500">测评完成</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#0A2463] mb-2 drop-shadow-sm">
                {result.type}
            </h1>
            <p className="text-2xl font-serif font-bold text-slate-700">
                {result.label}
            </p>
        </motion.div>

        {/* --- Analysis Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
            
            {/* Left: Radar Chart (Glass Card) */}
            <motion.div 
                className="lg:col-span-5 h-[400px] relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgba(10,36,99,0.05)]"
                {...({
                  initial: { opacity: 0, x: -30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.8, delay: 0.2 }
                } as any)}
            >
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#0A2463]" />
                    <span className="text-sm font-bold tracking-wider uppercase opacity-70">能力维度</span>
                </div>
                <div className="w-full h-full p-4">
                    <Radar data={chartData} options={chartOptions} />
                </div>
            </motion.div>

            {/* Right: Description & Stats (Glass Card) */}
            <motion.div 
                className="lg:col-span-7 flex flex-col justify-center bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_32px_rgba(10,36,99,0.05)]"
                {...({
                  initial: { opacity: 0, x: 30 },
                  animate: { opacity: 1, x: 0 },
                  transition: { duration: 0.8, delay: 0.4 }
                } as any)}
            >
                <h3 className="text-xl font-bold font-serif mb-6 text-[#0A2463] border-l-4 border-[#D9F246] pl-4">
                    核心特质解析
                </h3>
                <p className="text-lg leading-relaxed text-slate-700 font-medium mb-8">
                    {result.summary}
                </p>

                {/* Stat Pills */}
                <div className="flex flex-wrap gap-3 mt-auto">
                    {radar.labels.slice(0, 3).map((label, idx) => (
                        <div key={idx} className="flex flex-col bg-white/50 border border-white/60 rounded-xl px-5 py-3 shadow-sm min-w-[100px]">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">{label}</span>
                            <span className="text-2xl font-black text-[#0A2463]">{radar.data[idx]}%</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

        {/* --- Recommended Careers (Tilt Cards) --- */}
        <motion.div 
            {...({
              initial: { opacity: 0, y: 30 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, delay: 0.6 }
            } as any)}
            className="mb-16"
        >
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0A2463]/20 to-transparent" />
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    适配专业与职业
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#0A2463]/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.careers.map((career, idx) => (
                    <div key={idx} className="h-56">
                        <TiltCard 
                            title={career}
                            subtitle="高匹配度"
                            icon={CAREER_ICONS[career] || BrainCircuit}
                            tag="适配度高"
                        />
                    </div>
                ))}
            </div>
        </motion.div>

        {/* --- Action Area --- */}
        <motion.div 
            className="flex flex-col md:flex-row justify-center items-center gap-6 pb-8"
            {...({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.6, delay: 0.8 }
            } as any)}
        >
            {/* Secondary Action */}
            <button 
                onClick={() => navigate('/quiz')}
                className="group flex items-center gap-2 px-8 py-4 rounded-full bg-white/40 border border-white/60 hover:bg-white hover:border-slate-300 transition-all duration-300 text-slate-600 font-bold backdrop-blur-md cursor-pointer"
            >
                <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                <span>重新测评</span>
            </button>

            {/* Primary Action (Coral Pop) */}
            <MagneticButton 
                onClick={() => navigate('/admissions')}
                className="!bg-[#FF6B6B] hover:!bg-[#FF8787] !text-white !border-none shadow-xl shadow-[#FF6B6B]/30 cursor-pointer"
            >
                <span>查看匹配方向</span>
                <ArrowRight className="w-5 h-5 ml-2" />
            </MagneticButton>
        </motion.div>
        </>
        )}
      </div>
    </MainLayout>
  );
};

export default QuizResult;
