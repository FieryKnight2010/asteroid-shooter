
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
      case 'rapidFire':
        return { color: '#ffff00', glow: 'rgba(255, 255, 0, 0.6)', border: '#ffaa00' };
      case 'shield':
        return { color: '#00ffff', glow: 'rgba(0, 255, 255, 0.6)', border: '#00aaaa' };
      case 'extraLife':
        return { color: '#ff00ff', glow: 'rgba(255, 0, 255, 0.6)', border: '#aa00aa' };
    }
  };

  const variant = getTypeVariant();
  const healthPercentage = health / maxHealth;
  const isPowerup = ['rapidFire', 'shield', 'extraLife'].includes(type);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - asteroidSize / 2,
        top: position.y - asteroidSize / 2,
        width: asteroidSize,
        height: asteroidSize,
        transform: `rotate(${rotation}rad)`,
        filter: `drop-shadow(0 0 ${isPowerup ? '6px' : '3px'} ${variant.glow})`,
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
      
      <svg width={asteroidSize} height={asteroidSize} viewBox="0 0 40 40">
        {/* Outer glow */}
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill="none"
          stroke={variant.glow}
          strokeWidth={isPowerup ? "4" : "3"}
          className={isPowerup ? "animate-pulse" : ""}
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
        
        {/* Powerup symbols */}
        {type === 'rapidFire' && (
          <>
            <polygon points="15,12 18,8 22,8 25,12 22,16 18,16" fill="#ff0000" className="animate-pulse" />
            <circle cx="13" cy="20" r="1.5" fill="#ff0000" />
            <circle cx="20" cy="22" r="1.5" fill="#ff0000" />
            <circle cx="27" cy="18" r="1.5" fill="#ff0000" />
          </>
        )}
        
        {type === 'shield' && (
          <>
            <polygon points="20,10 16,14 16,26 20,30 24,26 24,14" fill="#0088ff" className="animate-pulse" />
            <polygon points="20,12 18,15 18,24 20,26 22,24 22,15" fill="#00aaff" />
          </>
        )}
        
        {type === 'extraLife' && (
          <>
            <polygon points="20,10 15,15 15,20 20,25 25,20 25,15" fill="#ff0088" className="animate-pulse" />
            <circle cx="18" cy="17" r="1" fill="#ffffff" />
            <circle cx="22" cy="17" r="1" fill="#ffffff" />
            <polygon points="17,21 20,23 23,21" fill="#ffffff" />
          </>
        )}
        
        {/* Surface details for non-powerup asteroids */}
        {!isPowerup && (
          <>
            <circle cx="15" cy="15" r="2" fill={variant.border} opacity="0.7" />
            <circle cx="25" cy="25" r="1.5" fill={variant.border} opacity="0.8" />
            <circle cx="12" cy="28" r="1" fill={variant.border} opacity="0.6" />
            <circle cx="28" cy="12" r="1.2" fill={variant.border} opacity="0.7" />
          </>
        )}
        
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
