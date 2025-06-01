
import React from 'react';
import { Asteroid as AsteroidType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface AsteroidProps {
  asteroid: AsteroidType;
}

const Asteroid: React.FC<AsteroidProps> = ({ asteroid }) => {
  const { position, rotation, size } = asteroid;
  const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[size];

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - asteroidSize / 2,
        top: position.y - asteroidSize / 2,
        width: asteroidSize,
        height: asteroidSize,
        transform: `rotate(${rotation}rad)`,
      }}
    >
      <svg width={asteroidSize} height={asteroidSize} viewBox="0 0 40 40">
        <polygon
          points="20,2 32,8 38,20 32,32 20,38 8,32 2,20 8,8"
          fill="#8B4513"
          stroke="#654321"
          strokeWidth="2"
        />
        {/* Inner details */}
        <circle cx="15" cy="15" r="2" fill="#654321" />
        <circle cx="25" cy="25" r="1.5" fill="#654321" />
        <circle cx="12" cy="28" r="1" fill="#654321" />
      </svg>
    </div>
  );
};

export default Asteroid;
