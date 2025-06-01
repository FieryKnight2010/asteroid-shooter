
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
        transform: `rotate(${rotation + Math.PI / 2}rad)`, // Added 180 degrees (π radians) to flip orientation
      }}
    >
      {/* Main ship body */}
      <div className="relative w-full h-full">
        <svg width={size} height={size} viewBox="0 0 20 20">
          <polygon
            points="10,2 4,16 10,12 16,16"
            fill="#00ff00"
            stroke="#ffffff"
            strokeWidth="1"
          />
          {/* Thrust flame */}
          {isThrusting && (
            <polygon
              points="6,16 10,22 14,16"
              fill="#ff4500"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>
    </div>
  );
};

export default Spaceship;
