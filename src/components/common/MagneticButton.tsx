import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, onClick, className = '' }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    
    setPosition({ x: x * 0.15, y: y * 0.15 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={`relative px-8 py-4 bg-primary text-white font-bold rounded-full overflow-hidden group transition-colors duration-300 hover:text-accent-lime border border-transparent hover:border-accent-lime ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...({
        animate: { x: position.x, y: position.y },
        transition: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 }
      } as any)}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      {/* Hover glow effect */}
      <div className="absolute inset-0 -z-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};

export default MagneticButton;