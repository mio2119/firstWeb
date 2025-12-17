import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Zap, Shield, Anchor, Layout } from 'lucide-react';
import { PlanItem, StrategyType } from '../../data/admissions/mock_user_plan';
import { usePlan } from '../../context/PlanContext';

interface PlanBlueprintSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const PlanBlueprintSheet: React.FC<PlanBlueprintSheetProps> = ({ isOpen, onClose }) => {
    // Connect to global state
    const { plan, removeFromPlan } = usePlan();

    const getItemsByType = (type: StrategyType) => plan.filter(item => item.strategyType === type);

    const rushItems = getItemsByType('rush');
    const stableItems = getItemsByType('stable');
    const safeItems = getItemsByType('safe');

    const handleDelete = (uniId: string) => {
        removeFromPlan(uniId);
    };

    const renderColumn = (title: string, items: PlanItem[], colorTheme: 'rose' | 'amber' | 'emerald', icon: React.ElementType) => {
        const Icon = icon;
        // Theme mapping
        const themeStyles = {
            rose: { border: 'border-rose-200', text: 'text-rose-700', bg: 'bg-rose-50', headerBg: 'bg-rose-100/50', iconBg: 'bg-rose-500' },
            amber: { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50', headerBg: 'bg-amber-100/50', iconBg: 'bg-amber-500' },
            emerald: { border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', headerBg: 'bg-emerald-100/50', iconBg: 'bg-emerald-500' }
        };
        const t = themeStyles[colorTheme];

        return (
            <div className={`flex flex-col h-full bg-white/40 backdrop-blur-md rounded-2xl border ${t.border} overflow-hidden`}>
                {/* Column Header */}
                <div className={`p-4 ${t.headerBg} border-b ${t.border} flex items-center justify-between shrink-0`}>
                    <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${t.text}`} />
                        <h3 className={`text-sm font-black uppercase tracking-wider ${t.text}`}>{title}</h3>
                    </div>
                    <span className={`text-xs font-bold ${t.text} bg-white/50 px-2 py-0.5 rounded-full`}>{items.length}</span>
                </div>

                {/* List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 scrollbar-hide">
                    <AnimatePresence>
                        {items.length > 0 ? (
                            items.map(item => (
                                <motion.div
                                    key={item.uniId} // Use uniId for key as it matches the deletion logic
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group relative flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-serif text-white ${t.iconBg}`}>
                                        {item.logo_char}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 truncate">{item.universityName}</h4>
                                        <p className="text-[10px] text-slate-400">Added {item.addedDate}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.uniId)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-rose-500 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-60">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium">暂无院校</span>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[70] bg-[#0A2463]/40 backdrop-blur-sm"
                    />

                    {/* Sheet Container */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[80] h-[85vh] md:h-[70vh] bg-[#FDFCF8] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
                    >
                        {/* --- Header --- */}
                        <div className="relative px-8 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl font-serif font-black text-[#0A2463] flex items-center gap-3">
                                    <Layout className="w-6 h-6 text-amber-500" />
                                    志愿战略蓝图
                                </h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">
                                    共 <span className="text-[#0A2463] font-bold">{plan.length}</span> 所院校：
                                    <span className="text-rose-600 font-bold ml-1">{rushItems.length} 冲刺</span> /
                                    <span className="text-amber-600 font-bold ml-1">{stableItems.length} 稳妥</span> /
                                    <span className="text-emerald-600 font-bold ml-1">{safeItems.length} 保底</span>
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* --- Blueprint Grid --- */}
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 top-24 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

                        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 h-full min-h-[400px]">
                                {renderColumn("冲刺目标 (Rush)", rushItems, "rose", Zap)}
                                {renderColumn("稳妥选择 (Stable)", stableItems, "amber", Shield)}
                                {renderColumn("保底方案 (Safe)", safeItems, "emerald", Anchor)}
                            </div>
                        </div>

                        {/* --- Footer Decoration --- */}
                        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 w-full shrink-0" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PlanBlueprintSheet;