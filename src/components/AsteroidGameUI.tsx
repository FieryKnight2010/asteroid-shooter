
import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameState } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface AsteroidGameUIProps {
  gameState: GameState;
  onStart: () => void;
  onRestart: () => void;
}

const AsteroidGameUI: React.FC<AsteroidGameUIProps> = ({ 
  gameState, 
  onStart, 
  onRestart 
}) => {
  const currentLevelPoints = gameState.level * GAME_CONSTANTS.POINTS_PER_LEVEL;
  const previousLevelPoints = (gameState.level - 1) * GAME_CONSTANTS.POINTS_PER_LEVEL;
  const progressInLevel = gameState.score - previousLevelPoints;
  const pointsNeededForLevel = currentLevelPoints - previousLevelPoints;
  const progressPercentage = Math.min((progressInLevel / pointsNeededForLevel) * 100, 100);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score and Lives */}
      {gameState.gameStarted && (
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black bg-opacity-50 p-3 rounded">
            <div className="text-lg font-bold">Score: {gameState.score}</div>
            <div className="text-sm">Lives: {gameState.lives}</div>
            <div className="text-sm">Level: {gameState.level}</div>
            
            {/* Level progress bar */}
            <div className="mt-2">
              <div className="text-xs mb-1">
                Progress: {progressInLevel}/{pointsNeededForLevel}
              </div>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameState.gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-8 rounded-xl text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Asteroid Shooter</h1>
            <p className="mb-6">Destroy asteroids and survive as long as possible!</p>
            <p className="mb-6 text-sm text-gray-300">
              Level up every {GAME_CONSTANTS.POINTS_PER_LEVEL} points for increased difficulty
            </p>
            <button 
              onClick={onStart}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto mx-auto"
            >
              <Play size={20} />
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-8 rounded-xl text-center text-white">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
            <div className="mb-6">
              <p className="text-lg mb-2">Final Score: {gameState.score}</p>
              <p className="text-md mb-2">Level Reached: {gameState.level}</p>
            </div>
            <button 
              onClick={onRestart}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto mx-auto"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Paused */}
      {gameState.paused && gameState.gameStarted && !gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-6 rounded-xl text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Paused</h3>
            <p>Press P to resume</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsteroidGameUI;
