import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface TiltCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tag?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const TiltCard: React.FC<TiltCardProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  tag, 
  onClick, 
  className = '',
  style = {}
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Motion values for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth physics (Spring config)
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Map mouse position to rotation degrees
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]); // Slightly reduced rotation for glass realism
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  
  // Dynamic glow/reflection effect
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    
    // Calculate normalized position (-0.5 to 0.5)
    const xPct = (mouseXPos / width) - 0.5;
    const yPct = (mouseYPos / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative h-full group perspective-1000 cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: 1000, ...style } as any}
      {...({
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { type: "spring", stiffness: 50, damping: 20 }
      } as any)}
    >
      <motion.div
        className="relative h-full overflow-hidden flex flex-col justify-between p-6 bg-white/40 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_32px_rgba(10,36,99,0.05)] hover:bg-white/60 hover:border-accent-lime/50 hover:shadow-[0_15px_40px_rgba(10,36,99,0.1)] transition-all duration-300 ease-out"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        } as any}
      >
        
        {/* --- Glare Effect Overlay --- */}
        <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 pointer-events-none z-0"
            style={{ x: glareX, y: glareY } as any}
        />

        {/* --- Header: Icon & Tag --- */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          {/* Squircle Icon Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent-lime rounded-2xl scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(217,242,70,0.6)]" />
            <div className="relative w-12 h-12 bg-white/50 border border-white/60 rounded-2xl flex items-center justify-center transition-colors duration-300 group-hover:bg-transparent group-hover:border-transparent">
              <Icon 
                className="w-6 h-6 text-primary transition-colors duration-300" 
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Neon Tag */}
          {tag ? (
            <span className="px-3 py-1 bg-accent-lime text-primary text-[10px] font-mono font-bold tracking-wider rounded-full shadow-[0_2px_8px_rgba(217,242,70,0.4)]">
              {tag}
            </span>
          ) : (
            <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-accent-coral group-hover:shadow-[0_0_8px_#FF6B6B] transition-all duration-300" />
          )}
        </div>

        {/* --- Body: Content --- */}
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-primary mb-2 tracking-tight leading-none group-hover:translate-x-1 transition-transform duration-300">
            {title}
          </h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed group-hover:text-primary/70 transition-colors duration-300 line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* --- Hover Decoration: Arrow --- */}
        <div className="absolute bottom-6 right-6 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <div className="bg-white rounded-full p-2 shadow-lg">
                <ArrowUpRight className="w-4 h-4 text-accent-coral" strokeWidth={3} />
            </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default TiltCard;