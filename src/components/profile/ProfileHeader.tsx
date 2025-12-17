import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Sparkles, Pencil } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const PRESET_AVATARS = ["🎓", "🧑‍💻", "🎨", "🚀", "🦁", "🦉", "👩‍🔬", "🎹"];

const ProfileHeader: React.FC = () => {
  const { profile, mbti, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  // Generate Narrative based on data
  const getNarrative = () => {
    const loc = profile.province || "未知之地";
    const scoreText = profile.score > 0 ? `带着 ${profile.score} 分的积淀` : "正蓄势待发";
    const target = profile.targetCity ? `，目光投向 ${profile.targetCity}` : "";
    return `一位来自${loc}的求知者，${scoreText}${target}，正在书写属于自己的未来篇章。`;
  };

  return (
    <div className="relative">
      
      {/* Decorative Stamp (Top Right) */}
      <div className="absolute -top-6 -right-6 md:right-0 opacity-20 pointer-events-none rotate-12">
         <div className="w-32 h-32 border-4 border-double border-slate-800 rounded-full flex items-center justify-center">
             <div className="text-xs font-bold uppercase tracking-widest text-slate-800 text-center">
                 Smart Enroll<br/>Official<br/>Archive
             </div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-10">
        
        {/* --- Avatar: The Polaroid --- */}
        <div className="relative group shrink-0 rotate-[-2deg] hover:rotate-0 transition-transform duration-500 ease-out">
            {/* Paper Clip */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-12 border-2 border-slate-400 rounded-full z-20 bg-transparent" style={{ borderRadius: '10px' }} />
            
            {/* Photo Frame */}
            <div 
                onClick={() => setIsEditing(!isEditing)}
                className="w-48 h-56 bg-white p-3 pb-12 shadow-xl shadow-stone-300 border border-stone-100 cursor-pointer relative"
            >
                <div className="w-full h-full bg-slate-100 overflow-hidden flex items-center justify-center text-6xl text-slate-700 bg-[url('https://www.transparenttextures.com/patterns/dust.png')]">
                    {profile.avatar}
                </div>
                {/* Handwritten Caption */}
                <div className="absolute bottom-3 left-0 right-0 text-center font-serif text-sm text-slate-500 italic">
                    The Protagonist
                </div>
                
                {/* Edit Icon Overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            {/* Avatar Selection (Pop-out) */}
            {isEditing && (
                <div className="absolute top-full left-0 mt-4 bg-white p-4 shadow-xl border border-stone-200 rounded-sm z-30 grid grid-cols-4 gap-2 w-56">
                    {PRESET_AVATARS.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => { updateProfile({ avatar: emoji }); setIsEditing(false); }}
                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-amber-50 rounded"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* --- Text: The Biography --- */}
        <div className="flex-1 pt-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-5xl md:text-6xl font-serif font-black text-slate-800 mb-6 tracking-tight">
                    {profile.name}
                </h1>

                {/* Narrative Stats */}
                <div className="relative pl-6 border-l-2 border-amber-600/30 py-2 mb-8">
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-serif italic">
                        "{getNarrative()}"
                    </p>
                </div>

                {/* Ex Libris (Bookplate) - MBTI */}
                <div className="inline-flex items-center gap-4 px-6 py-3 border border-stone-300 bg-[#F5F2EB] shadow-sm mt-2">
                    <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center bg-white">
                        <Sparkles className="w-5 h-5 text-slate-800" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Cognitive Type</span>
                        <span className="text-lg font-bold font-serif text-slate-800">
                            {mbti ? `${mbti.type} 探索者` : "未定型 (Unwritten)"}
                        </span>
                    </div>
                </div>

            </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ProfileHeader;