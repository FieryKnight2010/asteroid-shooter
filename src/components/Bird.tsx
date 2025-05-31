
import React from 'react';
import { Bird as BirdIcon } from 'lucide-react';

interface BirdProps {
  y: number;
  velocity: number;
  gameStarted: boolean;
  gameOver: boolean;
}

const Bird: React.FC<BirdProps> = ({ y, velocity, gameStarted, gameOver }) => {
  const getRotation = () => {
    if (gameOver) return 90;
    if (!gameStarted) return 0;
    return Math.max(-30, Math.min(30, velocity * 2));
  };

  const getAnimationClass = () => {
    if (!gameStarted) return 'animate-bounce';
    return '';
  };

  return (
    <div
      className={`absolute transition-transform duration-100 ${getAnimationClass()}`}
      style={{
        left: '50%',
        top: `${y}px`,
        transform: `translateX(-50%) rotate(${getRotation()}deg)`,
        zIndex: 10,
      }}
    >
      <div className="relative">
        {/* Bird shadow for depth */}
        <div className="absolute top-1 left-1 opacity-30">
          <BirdIcon 
            size={40} 
            className="text-gray-800"
            fill="currentColor"
          />
        </div>
        
        {/* Main bird */}
        <BirdIcon 
          size={40} 
          className={`${gameOver ? 'text-red-500' : 'text-yellow-400'} drop-shadow-lg transition-colors duration-300`}
          fill="currentColor"
        />
        
        {/* Wing flap effect */}
        {gameStarted && !gameOver && velocity < 0 && (
          <div className="absolute inset-0 animate-ping">
            <BirdIcon 
              size={40} 
              className="text-yellow-300 opacity-60"
              fill="currentColor"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Bird;
