import React, { useEffect, useRef } from 'react';

const AdmissionsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Configuration
    const particleCount = 40;
    const connectionDistance = 180;
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];

    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4, // Slow drift velocity X
        vy: (Math.random() - 0.5) * 0.4, // Slow drift velocity Y
        size: Math.random() * 2 + 1, // Random size between 1 and 3
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and Draw Particles
      particles.forEach((p, index) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw Dot (Slate-300 equivalent: #cbd5e1)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(203, 213, 225, 0.6)'; // Slate-300 with opacity
        ctx.fill();

        // Draw Connections
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(203, 213, 225, ${0.2 * (1 - distance / connectionDistance)})`; // Fade out line based on distance
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(draw);
    };

    const animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#FDFCF8] overflow-hidden pointer-events-none">
       {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Subtle Gradient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDFCF8_100%)] opacity-80 z-10" />
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-20" />
    </div>
  );
};

export default AdmissionsBackground;