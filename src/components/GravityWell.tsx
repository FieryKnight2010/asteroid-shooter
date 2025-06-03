
import React from 'react';
import { GravityWell as GravityWellType } from '../types/asteroidGame';

interface GravityWellProps {
  gravityWell: GravityWellType;
}

const GravityWell: React.FC<GravityWellProps> = ({ gravityWell }) => {
  const { position, radius, lifespan, maxLifespan } = gravityWell;
  const opacity = lifespan / maxLifespan;
  const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - radius,
        top: position.y - radius,
        width: radius * 2,
        height: radius * 2,
      }}
    >
      {/* Outer gravity field */}
      <div
        className="absolute inset-0 rounded-full border-2 border-purple-500 animate-pulse"
        style={{
          opacity: opacity * 0.3,
          boxShadow: `0 0 ${radius / 4}px rgba(147, 51, 234, ${opacity * 0.5})`,
        }}
      />
      
      {/* Middle ring */}
      <div
        className="absolute rounded-full border border-purple-300"
        style={{
          left: radius * 0.3,
          top: radius * 0.3,
          width: radius * 1.4,
          height: radius * 1.4,
          opacity: opacity * 0.6 * pulseIntensity,
          boxShadow: `0 0 ${radius / 8}px rgba(196, 181, 253, ${opacity * 0.7})`,
        }}
      />
      
      {/* Core */}
      <div
        className="absolute rounded-full bg-purple-600"
        style={{
          left: radius * 0.8,
          top: radius * 0.8,
          width: radius * 0.4,
          height: radius * 0.4,
          opacity: opacity * 0.8,
          boxShadow: `0 0 ${radius / 6}px rgba(147, 51, 234, ${opacity})`,
        }}
      />
      
      {/* Particle effects */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.001;
        const particleRadius = radius * 0.7;
        const particleX = Math.cos(angle) * particleRadius;
        const particleY = Math.sin(angle) * particleRadius;
        
        return (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: radius + particleX,
              top: radius + particleY,
              opacity: opacity * 0.6,
              transform: `scale(${pulseIntensity})`,
            }}
          />
        );
      })}
    </div>
  );
};

export default GravityWell;
