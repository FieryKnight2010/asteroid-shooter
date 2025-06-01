
import { useState, useCallback, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const useParticleSystem = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  const createExplosion = useCallback((x: number, y: number, color: string = '#ffaa00', count: number = 8) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 4 + 2;
      
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        size: Math.random() * 4 + 2,
        color,
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const createTrail = useCallback((x: number, y: number, vx: number, vy: number) => {
    const particle: Particle = {
      id: particleIdRef.current++,
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: vx * 0.1 + (Math.random() - 0.5) * 0.5,
      vy: vy * 0.1 + (Math.random() - 0.5) * 0.5,
      life: 15,
      maxLife: 15,
      size: Math.random() * 2 + 1,
      color: '#ffff00',
    };
    
    setParticles(prev => [...prev, particle]);
  }, []);

  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 1,
          vx: particle.vx * 0.98,
          vy: particle.vy * 0.98,
        }))
        .filter(particle => particle.life > 0)
    );
  }, []);

  return {
    particles,
    createExplosion,
    createTrail,
    updateParticles,
  };
};
