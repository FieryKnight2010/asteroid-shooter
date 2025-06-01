
import React from 'react';
import { Asteroid as AsteroidType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface AsteroidProps {
  asteroid: AsteroidType;
}

const Asteroid: React.FC<AsteroidProps> = ({ asteroid }) => {
  const { position, rotation, size } = asteroid;
  const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[size];

  const getSizeVariant = () => {
    switch (size) {
      case 'large': return { color: '#8B4513', glow: 'rgba(139, 69, 19, 0.4)' };
      case 'medium': return { color: '#A0522D', glow: 'rgba(160, 82, 45, 0.4)' };
      case 'small': return { color: '#CD853F', glow: 'rgba(205, 133, 63, 0.4)' };
    }
  };

  const variant = getSizeVariant();

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - asteroidSize / 2,
        top: position.y - asteroidSize / 2,
        width: asteroidSize,
        height: asteroidSize,
        transform: `rotate(${rotation}rad)`,
        filter: `drop-shadow(0 0 3px ${variant.glow})`,
      }}
    >
      <svg width={asteroidSize} height={asteroidSize} viewBox="0 0 40 40">
        {/* Outer glow */}
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill="none"
          stroke={variant.glow}
          strokeWidth="3"
        />
        {/* Main asteroid body */}
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill={`url(#asteroidGradient-${size})`}
          stroke="#654321"
          strokeWidth="1.5"
        />
        {/* Surface details */}
        <circle cx="15" cy="15" r="2" fill="#654321" opacity="0.7" />
        <circle cx="25" cy="25" r="1.5" fill="#654321" opacity="0.8" />
        <circle cx="12" cy="28" r="1" fill="#654321" opacity="0.6" />
        <circle cx="28" cy="12" r="1.2" fill="#654321" opacity="0.7" />
        
        {/* Highlight */}
        <ellipse cx="18" cy="12" rx="3" ry="1.5" fill="rgba(255, 255, 255, 0.1)" />
        
        {/* Gradients */}
        <defs>
          <radialGradient id={`asteroidGradient-${size}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={variant.color} />
            <stop offset="70%" stopColor="#654321" />
            <stop offset="100%" stopColor="#4a3018" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Asteroid;
