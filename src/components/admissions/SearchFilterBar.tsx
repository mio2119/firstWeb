import React from 'react';
import { Search, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedProvince: string;
  onProvinceChange: (val: string) => void;
  selectedTag: string;
  onTagChange: (val: string) => void;
  provinces: string[];
  tags: string[];
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedProvince,
  onProvinceChange,
  selectedTag,
  onTagChange,
  provinces,
  tags
}) => {
  const allTag = tags[0] || "All Tiers";

  return (
    <motion.div 
      {...({
        initial: { y: -20, opacity: 0 },
        animate: { y: 0, opacity: 1 }
      } as any)}
      className="sticky top-20 z-40 w-full mb-8"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-2 md:p-3 flex flex-col md:flex-row items-center gap-4">
        
        {/* --- Search Input --- */}
        <div className="relative flex-1 w-full md:w-auto group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find your dream university..." 
            className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-amber-600/50 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 font-medium"
          />
        </div>

        {/* --- Divider (Desktop) --- */}
        <div className="hidden md:block w-px h-8 bg-slate-200" />

        {/* --- Controls --- */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          
          {/* Province Dropdown (Custom Style) */}
          <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <select 
                value={selectedProvince}
                onChange={(e) => onProvinceChange(e.target.value)}
                className="w-full h-12 pl-10 pr-8 bg-white border border-slate-200 rounded-xl appearance-none text-sm font-bold text-slate-700 outline-none focus:border-amber-600 cursor-pointer hover:bg-slate-50 transition-colors"
            >
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Tags (Horizontal Scroll) */}
          <div className="flex items-center gap-2">
            {tags.slice(1).map(tag => (
                <button
                    key={tag}
                    onClick={() => onTagChange(selectedTag === tag ? allTag : tag)}
                    className={`
                        whitespace-nowrap px-4 h-12 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border
                        ${selectedTag === tag 
                            ? 'bg-[#0A2463] text-white border-[#0A2463] shadow-lg shadow-[#0A2463]/20' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-amber-500 hover:text-amber-600'}
                    `}
                >
                    {tag}
                </button>
            ))}
            
            {/* Filter Icon for more (Visual only) */}
            <button className="h-12 w-12 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-500 bg-white transition-all">
                <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default SearchFilterBar;
