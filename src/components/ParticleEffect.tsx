
import React from 'react';

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

interface ParticleEffectProps {
  particles: Particle[];
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ particles }) => {
  return (
    <>
      {particles.map(particle => {
        const opacity = particle.life / particle.maxLife;
        return (
          <div
            key={particle.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        );
      })}
    </>
  );
};

export default ParticleEffect;
