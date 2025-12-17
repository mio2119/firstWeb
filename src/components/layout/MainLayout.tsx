import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DockNavigation from './DockNavigation.tsx';

// --- Internal Component: Contour Map Background ---
// Represents "Planning", "Terrain", and "Pathfinding"
const ContourBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
      <motion.svg
        className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        {...({
            animate: {
                x: [-20, 0, -20],
                y: [-20, 0, -20],
                rotate: [0, 2, 0]
            },
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
            }
        } as any)}
      >
        <defs>
          <pattern id="contour-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* Architectural Curves / Topographic Lines */}
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
            <path d="M0 50 C 40 10 60 90 100 50" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
            <path d="M0 0 C 30 50 70 50 100 0" fill="none" stroke="#CBD5E1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#contour-pattern)" />
      </motion.svg>
      
      {/* Warm Vignette Overlay to focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDFCF8_90%)]" />
    </div>
  );
};

interface MainLayoutProps {
  children?: React.ReactNode;
  activeTab?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    // Base Background: Warm Cream (#FDFCF8)
    <div className="min-h-screen bg-[#FDFCF8] relative selection:bg-amber-100 selection:text-amber-900 font-sans text-slate-900 overflow-x-hidden">
      
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <ContourBackground />
      </div>

      {/* --- Top Header (Clean Paper Style) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-slate-200/60 transition-all duration-300">
        <Link to="/home" className="flex items-center gap-2 group">
          {/* Logo Mark */}
          <div className="w-8 h-8 bg-[#0A2463] rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
            H
          </div>
          <div className="font-serif font-bold text-xl tracking-tight text-[#0A2463] group-hover:text-[#3E92CC] transition-colors">
            慧招启涯
          </div>
        </Link>
        
        {/* SCNU Logo Image */}
        <div className="flex items-center">
            <img 
                src="https://upload.wikimedia.org/wikipedia/zh/c/c2/South_China_Normal_University_Logo.svg" 
                alt="华师学工" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'; // Hide if fails
                }}
            />
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="relative z-10 flex-1 pt-24 pb-32 px-4 w-full max-w-5xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            {...({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
              transition: { duration: 0.3, ease: "easeOut" }
            } as any)}
            className="w-full"
          >
            {children ? children : <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- New Dock Navigation --- */}
      <DockNavigation />
      
    </div>
  );
};

export default MainLayout;