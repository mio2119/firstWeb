import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const QABackground: React.FC = () => {
  const [width, setWidth] = useState(1200); // Default width
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configuration
  const SPACING = 60; // 60px pinstripe spacing
  const DROP_COUNT = 15; // Number of light drops

  // Generate droplets only on client-side to match window width
  const drops = useMemo(() => {
    if (!mounted) return [];
    
    // Calculate Grid
    const maxCols = Math.ceil(width / SPACING);
    
    // Define Safe Zones (Keep center ~60% clear)
    // Left Zone: 0 - 20%
    // Right Zone: 80% - 100%
    const safeZoneStart = Math.floor(maxCols * 0.2); 
    const safeZoneEnd = Math.ceil(maxCols * 0.8);   

    const availableCols = [];
    for (let i = 0; i < maxCols; i++) {
        if (i < safeZoneStart || i > safeZoneEnd) {
            availableCols.push(i);
        }
    }

    const items = [];
    for (let i = 0; i < DROP_COUNT; i++) {
        if (availableCols.length === 0) break;
        
        // Randomly select a column from the safe zones
        const randomColIndex = Math.floor(Math.random() * availableCols.length);
        const col = availableCols[randomColIndex];

        items.push({
            id: i,
            left: col * SPACING,
            // Randomize timing for organic feel
            delay: Math.random() * 20, 
            duration: 10 + Math.random() * 10, // 10s - 20s duration (Very Slow)
            length: 120 + Math.random() * 150, // Length of the light trail
        });
    }
    return items;
  }, [mounted, width]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#FDFCF8] pointer-events-none">
      
      {/* Layer 1: The Academic Pinstripe (Static Base) */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
            backgroundImage: `repeating-linear-gradient(90deg, #0f172a 0px, #0f172a 1px, transparent 1px, transparent ${SPACING}px)`
        }}
      />

      {/* Layer 2: The Golden Flow (Dynamic Data Pulses) */}
      {drops.map((drop) => (
        <motion.div
            key={drop.id}
            className="absolute w-[1px] bg-gradient-to-b from-transparent via-amber-400 to-transparent"
            style={{
                left: drop.left,
                height: drop.length,
                top: -drop.length, // Start above viewport
                filter: 'blur(1px)', // Soften edges
                opacity: 0.4         // Low opacity
            }}
            animate={{
                y: '120vh' // Move past bottom
            }}
            transition={{
                duration: drop.duration,
                repeat: Infinity,
                delay: drop.delay,
                ease: "linear"
            }}
        />
      ))}

      {/* Layer 3: Focus Vignette (Protection Layer) */}
      {/* Keeps the center clean for text readability */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#FDFCF8_100%)] opacity-90" />
      
      {/* Optional: Top Fade to blend with Header */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#FDFCF8] to-transparent" />
    </div>
  );
};

export default QABackground;