
import React from 'react';
import { Asteroid as AsteroidType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface AsteroidProps {
  asteroid: AsteroidType;
}

const Asteroid: React.FC<AsteroidProps> = ({ asteroid }) => {
  const { position, rotation, size, type, health, maxHealth } = asteroid;
  const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[size];

  const getTypeVariant = () => {
    switch (type) {
      case 'normal':
        return { color: '#8B4513', glow: 'rgba(139, 69, 19, 0.4)', border: '#654321' };
      case 'fast':
        return { color: '#00ff00', glow: 'rgba(0, 255, 0, 0.4)', border: '#00aa00' };
      case 'armored':
        return { color: '#444444', glow: 'rgba(68, 68, 68, 0.4)', border: '#222222' };
      case 'explosive':
        return { color: '#ff4400', glow: 'rgba(255, 68, 0, 0.4)', border: '#cc3300' };
      case 'boss':
        return { color: '#aa00aa', glow: 'rgba(170, 0, 170, 0.6)', border: '#770077' };
    }
  };

  const variant = getTypeVariant();
  const healthPercentage = health / maxHealth;
  const bossSize = type === 'boss' ? asteroidSize * 1.5 : asteroidSize;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - bossSize / 2,
        top: position.y - bossSize / 2,
        width: bossSize,
        height: bossSize,
        transform: `rotate(${rotation}rad)`,
        filter: `drop-shadow(0 0 ${type === 'boss' ? '6px' : '3px'} ${variant.glow})`,
      }}
    >
      {/* Health bar for damaged asteroids */}
      {health < maxHealth && (
        <div
          className="absolute -top-2 left-0 right-0 h-1 bg-red-600 rounded"
          style={{
            width: `${healthPercentage * 100}%`,
            backgroundColor: healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000',
          }}
        />
      )}
      
      <svg width={bossSize} height={bossSize} viewBox="0 0 40 40">
        {/* Outer glow */}
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill="none"
          stroke={variant.glow}
          strokeWidth={type === 'boss' ? "4" : "3"}
        />
        {/* Main asteroid body */}
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill={`url(#asteroidGradient-${type}-${size})`}
          stroke={variant.border}
          strokeWidth="1.5"
        />
        
        {/* Type-specific details */}
        {type === 'armored' && (
          <>
            <rect x="16" y="16" width="8" height="8" fill="#666666" opacity="0.8" />
            <rect x="12" y="12" width="4" height="4" fill="#666666" opacity="0.6" />
            <rect x="24" y="24" width="4" height="4" fill="#666666" opacity="0.6" />
          </>
        )}
        
        {type === 'explosive' && (
          <>
            <circle cx="20" cy="20" r="3" fill="#ff0000" opacity="0.6" className="animate-pulse" />
            <circle cx="15" cy="15" r="1" fill="#ff0000" opacity="0.8" />
            <circle cx="25" cy="25" r="1" fill="#ff0000" opacity="0.8" />
          </>
        )}
        
        {type === 'boss' && (
          <>
            <circle cx="20" cy="20" r="4" fill={variant.color} opacity="0.8" />
            <polygon points="20,12 24,16 20,20 16,16" fill="#ffffff" opacity="0.3" />
          </>
        )}
        
        {/* Surface details */}
        <circle cx="15" cy="15" r="2" fill={variant.border} opacity="0.7" />
        <circle cx="25" cy="25" r="1.5" fill={variant.border} opacity="0.8" />
        <circle cx="12" cy="28" r="1" fill={variant.border} opacity="0.6" />
        <circle cx="28" cy="12" r="1.2" fill={variant.border} opacity="0.7" />
        
        {/* Highlight */}
        <ellipse cx="18" cy="12" rx="3" ry="1.5" fill="rgba(255, 255, 255, 0.1)" />
        
        {/* Gradients */}
        <defs>
          <radialGradient id={`asteroidGradient-${type}-${size}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={variant.color} />
            <stop offset="70%" stopColor={variant.border} />
            <stop offset="100%" stopColor="#4a3018" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Asteroid;
