import React from 'react';
import { motion } from 'framer-motion';

const MBTIBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#FDFCF8] pointer-events-none">
      {/* Texture Overlay for Paper Feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply z-10" />
      
      {/* 3D Scene Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-0"
        style={{ perspective: '1200px' }}
      >
        
        {/* --- The Core (Personality) --- */}
        {/* Large, stable sphere representing the self */}
        <motion.div 
          className="relative z-10 w-64 h-64 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 shadow-2xl shadow-slate-300/50 flex items-center justify-center"
          {...({
            animate: { 
                y: [0, -10, 0],
                scale: [1, 1.02, 1]
            },
            transition: {
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
            }
          } as any)}
        >
           {/* Subtle Surface Texture/Shine */}
           <div className="absolute top-10 left-12 w-24 h-16 bg-white/60 blur-2xl rounded-full transform -rotate-12" />
        </motion.div>


        {/* --- The Orbit System (Tilted Plane) --- */}
        {/* We rotate the entire plane on the X-axis to create the elliptical perspective. */}
        <div 
            className="absolute flex items-center justify-center [transform-style:preserve-3d]"
            style={{ transform: 'rotateX(75deg) rotateY(10deg)' }}
        >
           {/* The Orbit Path (Visual Ring) */}
           <div className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full border-[1.5px] border-amber-600/30 shadow-[0_0_30px_rgba(217,119,6,0.1)]" />

           {/* The Rotating Arm (Invisible container that spins) */}
           <motion.div
             className="absolute inset-0"
             {...({
                animate: { rotate: 360 },
                transition: { duration: 15, repeat: Infinity, ease: "linear" }
             } as any)}
           >
              {/* The Electron (Function Sphere) positioned on the ring */}
              <div 
                className="absolute top-0 left-1/2 -ml-3 -mt-3 w-6 h-6"
              >
                  {/* 
                      Counter-rotate the sphere on X so it faces the camera (Billboarding),
                      preventing it from looking flattened by the parent's tilt.
                  */}
                  <div 
                    className="w-full h-full bg-amber-600 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.8),inset_1px_1px_3px_rgba(255,255,255,0.5)]"
                    style={{ transform: 'rotateX(-75deg)' }}
                  />
              </div>
           </motion.div>
        </div>

      </div>
      
      {/* --- Vignette --- */}
      {/* Softens the edges and focuses attention on the center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDFCF8_100%)] opacity-70 z-20" />
    </div>
  );
};

export default MBTIBackground;