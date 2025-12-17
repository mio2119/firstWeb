import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import MagneticButton from '../components/common/MagneticButton.tsx';
import { MoveRight, Sparkles, ChevronDown, ScanLine, BrainCircuit } from 'lucide-react';
import { useUser } from '../context/UserContext.tsx';

// Word mappings: Index i of CHAOS becomes Index i of DATA
const CHAOS_WORDS = [
  "迷茫", "焦虑", "未知", "压力", "内卷", 
  "调剂", "失眠", "遗憾", "盲从", "复读",
  "差距", "选择", "竞争", "犹豫", "迷失"
];

const DATA_WORDS = [
  "MBTI", "985", "CAREER", "GPA", "TOP5", 
  "OFFER", "STEM", "A+", "QS100", "DATA", 
  "RANK", "GOAL", "211", "PLAN", "FOCUS"
];

export default function Intro() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chaosTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  
  // 0: Chaos (Wait for input), 1: Scanned (Wait for input), 2: Revealed (Final CTA)
  const [step, setStep] = useState(0);

  // 1. Check if user has already seen intro via Context
  useEffect(() => {
    if (profile.intro_seen) {
      navigate('/home', { replace: true });
    }
  }, [profile.intro_seen, navigate]);

  // 2. Initial Chaos Animation (Runs once on mount)
  useLayoutEffect(() => {
    // If we are redirecting, don't run animation
    if (profile.intro_seen) return;

    const ctx = gsap.context(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // --- Grid Distribution Logic (Prevents Clustering) ---
      const totalWords = CHAOS_WORDS.length;
      const isPortrait = h > w;
      const cols = isPortrait ? 3 : 5;
      const rows = isPortrait ? 5 : 3;
      
      const cellW = w / cols;
      const cellH = h / rows;

      // Create a shuffled list of grid slots (0 to 14)
      const gridSlots = gsap.utils.shuffle([...Array(totalWords).keys()]);

      const words = gsap.utils.toArray<HTMLElement>(".chaos-word");

      words.forEach((word, i) => {
        // Assign random unique slot
        const slotIndex = gridSlots[i] % (cols * rows); 
        const col = slotIndex % cols;
        const row = Math.floor(slotIndex / cols);

        // Calculate base position + random jitter within the cell
        const jitterX = gsap.utils.random(20, cellW - 100); 
        const jitterY = gsap.utils.random(20, cellH - 60);

        const x = (col * cellW) + jitterX;
        const y = (row * cellH) + jitterY;

        gsap.set(word, {
          x: x,
          y: y,
          opacity: 0,
          scale: gsap.utils.random(0.9, 1.2),
          filter: "blur(3px)", // Ink diffusion effect
          color: "#94a3b8", // Slate-400 (Muted Grey)
          fontFamily: "'Times New Roman', serif", // Serif for intellectual feel
        });
      });
      // ----------------------------------------------------

      // Fade in chaos (The Fog)
      gsap.to(".chaos-word", {
        duration: 2.5,
        opacity: 0.6, 
        stagger: { amount: 1.5, from: "random" },
        ease: "power2.out",
      });

      // Continuous floating motion (loop) - Slow and ink-like
      chaosTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: true });
      chaosTimelineRef.current.to(".chaos-word", {
        x: "+=random(-20, 20)",
        y: "+=random(-20, 20)",
        rotation: "random(-5, 5)",
        duration: 6,
        ease: "sine.inOut",
      });

    }, containerRef);

    return () => ctx.revert();
  }, [profile.intro_seen]);

  // 3. Animation Actions
  const runScan = () => {
    const ctx = gsap.context(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const scanDuration = 1.8;

      // Stop the chaos floating gracefully
      if (chaosTimelineRef.current) {
        chaosTimelineRef.current.pause();
      }

      // Scanner Line Animation (Golden Horizon)
      gsap.to(".scanner-line", {
        top: "120%",
        duration: scanDuration,
        ease: "power1.inOut",
      });

      // Grid Calculation (Target Positions)
      const cols = 5; 
      const rowHeight = 80;
      const colWidth = Math.min(w * 0.8, 800) / cols;
      const startX = (w - (colWidth * cols)) / 2 + (colWidth / 2); // Center grid
      const startY = h * 0.35;

      const chaosWords = gsap.utils.toArray<HTMLElement>(".chaos-word");
      
      chaosWords.forEach((word, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const targetX = startX + (col * colWidth) - (word.clientWidth / 2);
        const targetY = startY + (row * rowHeight);

        // Calculate when the scanner hits this row
        const progress = (targetY / h); 
        const delay = progress * scanDuration * 0.9; 

        gsap.to(word, {
          x: targetX,
          y: targetY,
          rotation: 0,
          scale: 1,
          filter: "blur(0px)",
          opacity: 1,
          color: "#0f172a", // Slate-900 (Deep Black/Navy)
          fontFamily: "JetBrains Mono, monospace", // Mono for data
          fontWeight: "bold",
          letterSpacing: "0.1em",
          duration: 0.6,
          ease: "expo.out",
          delay: delay,
          onStart: () => {
            // Morph text to data
            if (DATA_WORDS[i]) word.innerText = DATA_WORDS[i];
          }
        });
      });
    }, containerRef);
    
    setStep(1);
  };

  const runReveal = () => {
    const ctx = gsap.context(() => {
      // Data grid explodes/fades upwards
      gsap.to(".chaos-word", {
        y: "-=50",
        opacity: 0,
        filter: "blur(4px)",
        duration: 0.8,
        stagger: { amount: 0.2, grid: [3, 5], from: "center" },
        ease: "power2.in",
      });

      // Logo Animation (Cinematic Rise)
      gsap.fromTo(".main-logo", 
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.5 }
      );
      
      gsap.fromTo(".subtitle",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out", delay: 0.8 }
      );
    }, containerRef);

    setStep(2);
  };

  const handleStart = () => {
    // 1. Save state via Context
    updateProfile({ intro_seen: true });

    // 2. Exit Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => navigate('/home')
      });

      // Logo moves up subtly
      tl.to(".main-content", { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" });
      
      // Curtain wipes up (Brand Navy)
      tl.to(".exit-curtain", {
        height: "100%",
        duration: 1.0,
        ease: "expo.inOut"
      }, "<0.2");
    }, containerRef);
  };

  // Render the control button based on step
  const renderControl = () => {
    if (step === 0) {
      return (
        <button 
          onClick={runScan}
          className="group flex flex-col items-center gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-sm font-serif tracking-[0.2em] uppercase text-slate-500 border border-slate-300 px-6 py-3 rounded-sm bg-white/40 backdrop-blur-sm group-hover:bg-amber-600 group-hover:border-amber-600 group-hover:text-white group-hover:shadow-xl transition-all duration-500 ease-out">
            <ScanLine className="w-4 h-4" />
            <span>Initialize Scan</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 animate-bounce opacity-60" />
        </button>
      );
    }
    if (step === 1) {
      return (
        <button 
          onClick={runReveal}
          className="group flex flex-col items-center gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 text-sm font-serif tracking-[0.2em] uppercase text-slate-500 border border-slate-300 px-6 py-3 rounded-sm bg-white/40 backdrop-blur-sm group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white group-hover:shadow-xl transition-all duration-500 ease-out">
            <BrainCircuit className="w-4 h-4" />
            <span>Construct Reality</span>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 animate-bounce opacity-60" />
        </button>
      );
    }
    return null; // Step 2 uses the main CTA
  };

  return (
    <div ref={containerRef} className="relative w-screen h-screen overflow-hidden bg-[#FDFCF8] font-sans">
      
      {/* Background Grid (Paper Texture Feel) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDFCF8_90%)] pointer-events-none" />

      {/* --- ACT 1 & 2 Elements (Words) --- */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {CHAOS_WORDS.map((word, i) => (
          <div 
            key={i} 
            className="chaos-word absolute text-3xl font-medium whitespace-nowrap will-change-transform"
            style={{ opacity: 0 }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* Scanner Line (Golden Horizon) */}
      <div className="scanner-line absolute left-0 right-0 h-[2px] bg-amber-600 shadow-[0_0_40px_rgba(217,119,6,0.8)] z-20 top-[-20px] will-change-transform" />

      {/* --- ACT 3: Main Content (Logo & CTA) --- */}
      <div className="main-content absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
        <div className="main-logo opacity-0 flex flex-col items-center text-center">
            
            {/* BRAND COLOR UPDATE: #0A2463 */}
            <h1 className="text-5xl md:text-7xl font-black text-[#0A2463] tracking-tighter mb-4 leading-tight">
              SMART<span className="text-amber-600">.</span>ENROLL
            </h1>
            <p className="subtitle opacity-0 text-sm md:text-base text-slate-500 font-serif tracking-[0.4em] uppercase mb-16 border-t border-slate-200 pt-6">
              慧招启涯 &middot; Future Academy Intelligence
            </p>
        </div>
        
        {/* Final CTA Container */}
        <div className="pointer-events-auto min-h-[80px]">
           {step === 2 && (
             <motion.div 
               {...({
                 initial: { opacity: 0, y: 30 },
                 animate: { opacity: 1, y: 0 },
                 transition: { duration: 0.8, ease: "easeOut" }
               } as any)}
             >
               <MagneticButton 
                 onClick={handleStart} 
                 className="!bg-[#0A2463] !text-white hover:!bg-amber-600 hover:!text-white !border-none !rounded-sm px-10 py-5 shadow-2xl shadow-[#0A2463]/20"
               >
                 <span className="font-serif tracking-widest text-sm">ENTER SYSTEM</span>
                 <MoveRight className="w-4 h-4 ml-3" />
               </MagneticButton>
             </motion.div>
           )}
        </div>
      </div>

      {/* --- Step Controller (Bottom) --- */}
      <div className="absolute bottom-16 left-0 right-0 z-40 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            {...({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
              transition: { duration: 0.5 }
            } as any)}
          >
            {renderControl()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Exit Transition Curtain (Brand Navy) */}
      <div className="exit-curtain absolute bottom-0 left-0 right-0 h-0 bg-[#0A2463] z-50" />
    </div>
  );
}