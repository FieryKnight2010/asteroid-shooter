
import React from 'react';
import { Spaceship as SpaceshipType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface SpaceshipProps {
  spaceship: SpaceshipType;
  isThrusting: boolean;
}

const Spaceship: React.FC<SpaceshipProps> = ({ spaceship, isThrusting }) => {
  const { position, rotation } = spaceship;
  const size = GAME_CONSTANTS.SPACESHIP_SIZE;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        transform: `rotate(${rotation + Math.PI / 2}rad)`,
        filter: 'drop-shadow(0 0 4px rgba(0, 255, 0, 0.5))',
      }}
    >
      {/* Main ship body */}
      <div className="relative w-full h-full">
        <svg width={size} height={size} viewBox="0 0 20 20">
          {/* Ship outline glow */}
          <polygon
            points="10,2 4,16 10,12 16,16"
            fill="none"
            stroke="rgba(0, 255, 0, 0.3)"
            strokeWidth="3"
          />
          {/* Main ship body */}
          <polygon
            points="10,2 4,16 10,12 16,16"
            fill="url(#shipGradient)"
            stroke="#00ff00"
            strokeWidth="1"
          />
          {/* Ship details */}
          <line x1="10" y1="4" x2="10" y2="10" stroke="#ffffff" strokeWidth="1" />
          <circle cx="8" cy="8" r="1" fill="#00ffff" />
          <circle cx="12" cy="8" r="1" fill="#00ffff" />
          
          {/* Thrust flame */}
          {isThrusting && (
            <>
              <polygon
                points="6,16 10,24 14,16"
                fill="url(#flameGradient)"
                className="animate-pulse"
              />
              <polygon
                points="7,16 10,22 13,16"
                fill="#ffff00"
                className="animate-pulse"
              />
            </>
          )}
          
          {/* Gradients */}
          <defs>
            <linearGradient id="shipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00ff00" />
              <stop offset="50%" stopColor="#00aa00" />
              <stop offset="100%" stopColor="#006600" />
            </linearGradient>
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4500" />
              <stop offset="50%" stopColor="#ff6600" />
              <stop offset="100%" stopColor="#ffaa00" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Spaceship;
