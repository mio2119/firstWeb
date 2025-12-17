import React from 'react';
import { motion } from 'framer-motion';

interface MBTIBlurredBackgroundProps {
  children: React.ReactNode;
}

const MBTIBlurredBackground: React.FC<MBTIBlurredBackgroundProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen bg-[#FDFCF8] overflow-hidden font-sans">
      
      {/* --- The Blurred Background Layer --- */}
      {/* Pointer events none ensures clicks pass through to content if needed, though usually background is inert */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* 
            Container for the 3D Object.
            CRITICAL: Applying `blur-2xl` here defocuses everything inside, creating the "Background" look.
            Opacity 80% blends it nicely with the warm cream background.
        */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] blur-2xl opacity-80">
           
           {/* The 3D Perspective Plane */}
           <div 
             className="relative w-full h-full flex items-center justify-center" 
             style={{ transform: 'perspective(1000px) rotateX(60deg)' }}
           >
              
              {/* 1. The Golden Elliptical Ring */}
              <div className="absolute inset-0 border-[3px] border-amber-500/40 rounded-full shadow-[0_0_60px_rgba(245,158,11,0.4)]" />
              
              {/* 2. Inner Glow/Core */}
              <div className="absolute w-1/3 h-1/3 bg-amber-200/20 rounded-full blur-3xl" />

              {/* 3. The Orbiting Sphere */}
              <motion.div
                className="absolute inset-0"
                {...({
                  animate: { rotate: 360 },
                  transition: { duration: 20, repeat: Infinity, ease: "linear" }
                } as any)}
              >
                {/* 
                    Positioned at the "top" of the ring.
                    Counter-rotated (rotateX -60deg) so it looks spherical, not flat, despite the parent perspective.
                */}
                <div 
                    className="absolute top-0 left-1/2 -ml-10 -mt-10 w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-lg"
                    style={{ transform: 'rotateX(-60deg)' }} 
                />
              </motion.div>
           </div>
        </div>
      </div>

      {/* --- Content Layer --- */}
      {/* Relative positioning ensures children sit ABOVE the absolute background */}
      <div className="relative z-10 w-full h-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default MBTIBlurredBackground;