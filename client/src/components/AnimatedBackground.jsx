import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const createParticles = () => {
      const container = particlesRef.current;
      if (!container) return;

      const particleCount = 50;
      container.innerHTML = ''; // Clear existing particles

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
        container.appendChild(particle);
      }
    };

    createParticles();
  }, []);

  return (
    <>
      {/* Particles Background */}
      <div
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ zIndex: 1 }}
      />
      
      {/* Gradient Overlays */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </motion.div>
    </>
  );
}