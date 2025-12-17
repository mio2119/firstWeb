import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const ExploreBackground: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration for "Rising Beacons"
  const beacons = useMemo(() => {
    if (!mounted) return [];
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      // Random delay to create organic staggering
      delay: Math.random() * 10,
      // Slow duration for "floating" feel
      duration: 15 + Math.random() * 10,
      type: Math.random() > 0.6 ? 'diamond' : Math.random() > 0.3 ? 'square' : 'plus',
      // Mix of faint Slate (Structure) and Amber (Opportunity)
      colorClass: Math.random() > 0.7 ? 'border-amber-400/40 bg-amber-50/10' : 'border-slate-300/40 bg-slate-50/5',
      size: 16 + Math.random() * 24, // Size in px
    }));
  }, [mounted]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#FDFCF8] pointer-events-none">
      
      {/* --- Layer 3: Atmospheric Glow (The Sunrise) --- */}
      {/* Positioned top-right to guide the eye forward */}
      <motion.div 
        className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] bg-amber-100/30 rounded-full blur-[120px]"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* --- Layer 1: The Infinite Floor (3D Perspective) --- */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[65vh] flex items-end justify-center overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-[200%] h-[200%] -ml-[50%] origin-bottom"
          style={{ 
            rotateX: 60,
            // Neo-Classic Grid: Faint Slate lines
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            // Fog Mask: Fades out the grid as it reaches the "horizon" (top of this element)
            maskImage: 'linear-gradient(to top, black 20%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 90%)'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '0px 60px'] // Infinite Scroll forward
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* --- Layer 2: The Rising Beacons (Opportunities) --- */}
      <div className="absolute inset-0 z-10">
        {beacons.map((b) => (
          <motion.div
            key={b.id}
            className={`absolute flex items-center justify-center border ${b.colorClass} backdrop-blur-sm`}
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              // Shapes logic
              transform: b.type === 'diamond' ? 'rotate(45deg)' : 'none',
              borderRadius: b.type === 'square' || b.type === 'diamond' ? '4px' : '0px',
            }}
            initial={{ 
              y: '100vh', 
              opacity: 0, 
              scale: 0.5,
              rotateX: 0, 
              rotateY: 0 
            }}
            animate={{
              y: '20vh', // Rise up towards the horizon line
              opacity: [0, 0.6, 0], // Fade in then out
              scale: [0.5, 1, 0.8], // Simulate perspective volume
              rotateX: [0, 180],
              rotateY: [0, 180],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {/* Inner Details for 'Plus' shape */}
            {b.type === 'plus' && (
              <div className="relative w-full h-full border-none">
                 <div className="absolute top-1/2 left-1/4 w-1/2 h-[1px] bg-slate-300/60" />
                 <div className="absolute left-1/2 top-1/4 h-1/2 w-[1px] bg-slate-300/60" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* --- Horizon Blend --- */}
      {/* A solid gradient at the top to ensure header readability and blend the 3D floor */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent z-20" />
      
    </div>
  );
};

export default ExploreBackground;