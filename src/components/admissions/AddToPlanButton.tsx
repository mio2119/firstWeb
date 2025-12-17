import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check, Zap, Shield, Anchor, Trash2 } from 'lucide-react';
import { usePlan } from '../../context/PlanContext';
import type { UniversityIndexItem } from '../../data/types/admissions';
import { StrategyType } from '../../data/admissions/mock_user_plan';

interface AddToPlanButtonProps {
    university: UniversityIndexItem;
    className?: string;
}

const AddToPlanButton: React.FC<AddToPlanButtonProps> = ({ university, className = "" }) => {
    const { addToPlan, removeFromPlan, isInPlan, getPlanItem } = usePlan();
    const [isOpen, setIsOpen] = useState(false);

    const isSaved = isInPlan(university.id);
    const savedItem = getPlanItem(university.id);

    const handleOptionSelect = (strategy: StrategyType) => {
        addToPlan(university, strategy);
        setIsOpen(false);
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIsOpen(!isOpen);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromPlan(university.id);
        setIsOpen(false);
    };

    // Helper to get color/icon based on saved strategy
    const getSavedStyle = () => {
        if (!savedItem) return { bg: 'bg-amber-500', border: 'border-amber-500', icon: Check, label: '已加入' };
        switch(savedItem.strategyType) {
            case 'rush': return { bg: 'bg-rose-500', border: 'border-rose-500', icon: Zap, label: '冲刺' };
            case 'stable': return { bg: 'bg-amber-500', border: 'border-amber-500', icon: Shield, label: '稳妥' };
            case 'safe': return { bg: 'bg-emerald-500', border: 'border-emerald-500', icon: Anchor, label: '保底' };
            default: return { bg: 'bg-amber-500', border: 'border-amber-500', icon: Check, label: '已加入' };
        }
    };

    const style = isSaved ? getSavedStyle() : null;
    const Icon = style?.icon || Bookmark;

    return (
        <div className={`relative ${className}`}>
            <motion.button
                onClick={handleToggle}
                whileTap={{ scale: 0.95 }}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm border
                    ${isSaved
                        ? `${style?.bg} ${style?.border} text-white shadow-lg`
                        : 'bg-white border-[#0A2463]/20 text-[#0A2463] hover:border-amber-500 hover:text-amber-600'}
                `}
            >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{isSaved ? `${style?.label}目标` : '加入志愿蓝图'}</span>
            </motion.button>

            {/* Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                         {!isSaved ? (
                             <>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">设为...</div>
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => handleOptionSelect('rush')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-rose-50 text-left group transition-colors">
                                        <div className="p-1.5 rounded-md bg-rose-100 text-rose-600"><Zap className="w-3 h-3" /></div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-rose-700">冲刺 (Rush)</span>
                                    </button>
                                    <button onClick={() => handleOptionSelect('stable')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-amber-50 text-left group transition-colors">
                                        <div className="p-1.5 rounded-md bg-amber-100 text-amber-600"><Shield className="w-3 h-3" /></div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">稳妥 (Stable)</span>
                                    </button>
                                    <button onClick={() => handleOptionSelect('safe')} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-emerald-50 text-left group transition-colors">
                                        <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600"><Anchor className="w-3 h-3" /></div>
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">保底 (Safe)</span>
                                    </button>
                                </div>
                             </>
                         ) : (
                             <div className="flex flex-col gap-1">
                                 <div className="px-3 py-2 text-xs text-slate-400">已添加到 {getSavedStyle().label}</div>
                                 <button onClick={handleRemove} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-100 text-left group transition-colors text-slate-500 hover:text-rose-600">
                                     <Trash2 className="w-4 h-4" />
                                     <span className="text-sm font-bold">移除该院校</span>
                                 </button>
                             </div>
                         )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddToPlanButton;
