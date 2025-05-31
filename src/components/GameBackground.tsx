
import React from 'react';
import { GAME_CONSTANTS } from '../constants/gameConstants';

const GameBackground: React.FC = () => {
  return (
    <>
      {/* Background clouds */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-16 h-10 bg-white rounded-full opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-12 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
        <div className="absolute top-60 left-32 w-12 h-8 bg-white rounded-full opacity-50 animate-pulse delay-700"></div>
      </div>

      {/* Ground */}
      <div 
        className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400" 
        style={{ height: GAME_CONSTANTS.GROUND_HEIGHT }}
      ></div>
    </>
  );
};

export default GameBackground;
