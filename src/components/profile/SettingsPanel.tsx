import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload, AlertTriangle, PenTool, MapPin, Hash, Target, Book } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import {
  CHINA_PROVINCE_CITY_GROUPS,
  CITY_NAMES,
  PROVINCE_NAMES,
  normalizeProvinceName,
} from '../../data/profile/chinaLocations';

const SettingsPanel: React.FC = () => {
  const { profile, updateProfile, exportData, importData, resetData } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const selectedProvince = normalizeProvinceName(profile.province);
  const hasCustomProvince = Boolean(profile.province && !PROVINCE_NAMES.includes(selectedProvince));
  const hasCustomTargetCity = Boolean(profile.targetCity && !CITY_NAMES.includes(profile.targetCity));

  useEffect(() => {
    if (profile.province && selectedProvince !== profile.province) {
      updateProfile({ province: selectedProvince });
    }
  }, [profile.province, selectedProvince, updateProfile]);
  
  const handleChange = (field: string, value: any) => {
    updateProfile({ [field]: value });
  };

  const handleProvinceChange = (value: string) => {
    updateProfile({ province: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      setNotice({ type: 'success', text: '档案读取成功，已同步到当前页面。' });
    } catch (error) {
      setNotice({
        type: 'error',
        text: error instanceof Error ? error.message : '文件格式似乎有误，无法读取。'
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleReset = () => {
    resetData();
    setIsResetConfirmOpen(false);
    setNotice({ type: 'success', text: '新篇章已开启，个人档案已重置。' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      
      {/* --- Main Manuscript Form (Left 2/3) --- */}
      <div className="md:col-span-2 relative">
        {/* Background Paper Sheet Effect */}
        <div className="absolute inset-0 bg-white shadow-sm border border-stone-200 transform -rotate-1 rounded-sm z-0" />
        <div className="relative z-10 bg-[#FDFBF7] p-8 md:p-12 border border-stone-200 shadow-lg min-h-[500px]">
            
            <div className="flex items-center gap-3 mb-10 border-b-2 border-stone-800 pb-4">
               <PenTool className="w-6 h-6 text-stone-800" />
               <h3 className="text-xl font-serif font-bold text-stone-800 tracking-wide">作者档案设定</h3>
            </div>

            <div className="space-y-10 font-serif text-stone-700">
                
                {/* 1. Identity */}
                <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-amber-700 transition-colors">
                        笔者署名 (Nickname)
                    </label>
                    <input 
                        type="text" 
                        value={profile.name} 
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full bg-transparent border-b-2 border-stone-300 py-2 text-2xl font-bold text-stone-800 focus:border-amber-600 focus:outline-none transition-colors placeholder-stone-300"
                        placeholder="请输入您的名字..."
                    />
                </div>

                {/* 2. Coordinates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-amber-700">
                            <MapPin className="w-3 h-3" />
                            始发地 (Origin)
                        </label>
                        <select 
                            value={selectedProvince} 
                            onChange={(e) => handleProvinceChange(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-stone-300 py-2 text-lg font-bold text-stone-800 focus:border-amber-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">选择省份...</option>
                            {hasCustomProvince && <option value={selectedProvince}>{selectedProvince}</option>}
                            {PROVINCE_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-amber-700">
                            <Target className="w-3 h-3" />
                            目的地 (Destination)
                        </label>
                        <select 
                            value={profile.targetCity} 
                            onChange={(e) => handleChange('targetCity', e.target.value)}
                            className="w-full bg-transparent border-b-2 border-stone-300 py-2 text-lg font-bold text-stone-800 focus:border-amber-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                        >
                            <option value="">意向城市</option>
                            {hasCustomTargetCity && <option value={profile.targetCity}>{profile.targetCity}</option>}
                            {CHINA_PROVINCE_CITY_GROUPS.map(group => (
                                <optgroup key={group.province} label={group.province}>
                                    {group.cities.map(city => <option key={`${group.province}-${city}`} value={city}>{city}</option>)}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Stats */}
                <div className="group">
                     <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 group-focus-within:text-amber-700">
                        <Hash className="w-3 h-3" />
                        当前积淀 (Current Score)
                    </label>
                    <div className="flex items-baseline gap-2">
                        <input 
                            type="number" 
                            value={profile.score || ''} 
                            onChange={(e) => handleChange('score', parseInt(e.target.value) || 0)}
                            className="w-32 bg-transparent border-b-2 border-stone-300 py-2 text-4xl font-black font-mono text-stone-800 focus:border-amber-600 focus:outline-none transition-colors placeholder-stone-300"
                            placeholder="0"
                        />
                        <span className="font-serif italic text-stone-400">pts</span>
                    </div>
                </div>

            </div>

            {/* Auto-save Indicator */}
            <div className="mt-12 flex justify-end">
                <div className="flex items-center gap-2 text-stone-400 font-serif italic text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Ink is drying... (Auto-saved)</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- Tools & Actions (Right 1/3) --- */}
      <div className="space-y-8 pt-4">
         
         {/* Archive Actions */}
         <div className="bg-[#F5F2EB] border border-stone-200 p-6 shadow-md relative">
            {/* Visual: Binder Clip */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 border-4 border-stone-300 rounded-t-lg border-b-0" />
            
            <h3 className="text-sm font-bold font-serif text-stone-800 mb-6 text-center uppercase tracking-widest border-b border-stone-300 pb-2">
                Chronicle Archives
            </h3>
            
            <div className="space-y-4">
              <button 
                onClick={exportData}
                className="w-full group flex items-center justify-between px-4 py-3 bg-stone-800 text-[#F9F7F2] hover:bg-amber-700 transition-all duration-300 shadow-lg"
              >
                <span className="font-serif font-bold">装订手稿</span>
                <Book className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full group flex items-center justify-between px-4 py-3 bg-white border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <span className="font-serif font-bold">读取档案</span>
                <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange}
              />
            </div>

            <AnimatePresence>
              {notice && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className={`mt-4 rounded-lg border px-3 py-2 text-xs font-bold ${
                    notice.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {notice.text}
                </motion.div>
              )}
            </AnimatePresence>
         </div>

         {/* Reset Action */}
         <div className="p-6 border-2 border-dashed border-rose-200 rounded-lg text-center opacity-70 hover:opacity-100 transition-opacity">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">
              Redrafting
            </h3>
            <button 
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-rose-600 font-serif font-bold italic border-b border-rose-300 hover:border-rose-600 hover:text-rose-800 transition-colors pb-0.5"
            >
              开启新篇章 (Reset All)
            </button>
         </div>

      </div>

      <AnimatePresence>
        {isResetConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-900/30 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="w-full max-w-sm bg-[#FDFBF7] border border-stone-200 shadow-2xl p-6"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-800 mb-2">确认重新开始</h3>
              <p className="text-sm text-stone-500 leading-relaxed mb-6">
                这会清空当前档案、收藏、足迹与测评结果。建议先装订手稿导出备份。
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-4 py-2 bg-white border border-stone-200 text-stone-500 text-sm font-bold hover:bg-stone-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-colors"
                >
                  确认重置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SettingsPanel;
