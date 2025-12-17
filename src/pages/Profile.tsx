import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { User, Bookmark, History, Settings, Feather } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader.tsx';
import FavoritesPanel from '../components/profile/FavoritesPanel.tsx';
import HistoryPanel from '../components/profile/HistoryPanel.tsx';
import SettingsPanel from '../components/profile/SettingsPanel.tsx';

const SECTIONS = [
  { id: 'identity', label: '人物志', icon: User },
  { id: 'collection', label: '收藏集', icon: Bookmark },
  { id: 'chronicle', label: '足迹', icon: History },
  { id: 'desk', label: '工作台', icon: Settings },
];

const Profile: React.FC = () => {
  const [activeSection, setActiveSection] = useState('identity');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  // Intersection Observer to update active TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F9F7F2] font-serif text-slate-800">
      
      {/* --- Atmosphere: Paper Texture & Golden Hour Light --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
        
        {/* Golden Hour Light Source (Drifting) */}
        <motion.div 
            className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-amber-200/20 rounded-full blur-[120px]"
            animate={{ 
                x: [0, -50, 0],
                y: [0, 50, 0],
                opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* --- Reading Progress Bar (Top) --- */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-600 origin-left z-50 opacity-50"
        style={{ scaleX }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 lg:gap-24">
        
        {/* --- Left Sidebar: Table of Contents (Sticky) --- */}
        <aside className="hidden md:block w-48 shrink-0 relative">
          <div className="sticky top-32">
            <div className="mb-8 flex items-center gap-2 opacity-60">
                <Feather className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-800">Index</span>
            </div>
            
            <nav className="space-y-6 border-l-2 border-slate-200 pl-6">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`group flex items-center gap-3 transition-all duration-300 relative ${activeSection === sec.id ? 'translate-x-2' : ''}`}
                >
                  {/* Active Indicator Line */}
                  {activeSection === sec.id && (
                     <motion.div 
                        layoutId="toc-indicator"
                        className="absolute -left-[26px] w-1 h-6 bg-amber-600 rounded-full"
                     />
                  )}
                  
                  <span className={`text-sm font-bold tracking-widest uppercase transition-colors ${activeSection === sec.id ? 'text-amber-800' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {sec.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* --- Right Content: The Manuscript --- */}
        <main className="flex-1 space-y-24 md:space-y-32">
          
          {/* Section 1: Identity (Header) */}
          <section id="identity" className="scroll-mt-32">
            <ProfileHeader />
          </section>

          {/* Section 2: Collection (Favorites) */}
          <section id="collection" className="scroll-mt-32">
            <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-12 bg-slate-300" />
                <h2 className="text-2xl italic font-bold text-slate-700">The Collection</h2>
            </div>
            <FavoritesPanel />
          </section>

          {/* Section 3: Chronicle (History) */}
          <section id="chronicle" className="scroll-mt-32">
             <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-12 bg-slate-300" />
                <h2 className="text-2xl italic font-bold text-slate-700">Journey Footprints</h2>
            </div>
            <HistoryPanel />
          </section>

          {/* Section 4: Desk (Settings) */}
          <section id="desk" className="scroll-mt-32">
             <div className="flex items-center gap-4 mb-10">
                <div className="h-px w-12 bg-slate-300" />
                <h2 className="text-2xl italic font-bold text-slate-700">Author's Desk</h2>
            </div>
            <SettingsPanel />
          </section>

          {/* Footer Signature */}
          <div className="pt-20 pb-10 text-center border-t border-slate-200/60">
             <p className="text-slate-400 font-serif italic text-sm">
               "Every choice writes a new sentence in your story."
             </p>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Profile;