
import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameState } from '../types/asteroidGame';

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
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score and Lives */}
      {gameState.gameStarted && (
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black bg-opacity-50 p-3 rounded">
            <div className="text-lg font-bold">Score: {gameState.score}</div>
            <div className="text-sm">Lives: {gameState.lives}</div>
            
            {/* Active Powerups */}
            {(gameState.powerups.rapidFire > 0 || gameState.powerups.shield > 0) && (
              <div className="mt-2 text-xs">
                {gameState.powerups.rapidFire > 0 && (
                  <div className="text-yellow-400 animate-pulse">
                    Rapid Fire: {Math.ceil(gameState.powerups.rapidFire / 60)}s
                  </div>
                )}
                {gameState.powerups.shield > 0 && (
                  <div className="text-cyan-400 animate-pulse">
                    Shield: {Math.ceil(gameState.powerups.shield / 60)}s
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameState.gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-8 rounded-xl text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Asteroid Shooter</h1>
            <p className="mb-6">Destroy asteroids and survive as long as possible!</p>
            <p className="mb-4 text-sm text-gray-300">
              Look for special powerup asteroids:
            </p>
            <div className="mb-6 text-xs text-left max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Yellow: Rapid Fire</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                <span>Cyan: Shield Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded"></div>
                <span>Pink: Extra Life</span>
              </div>
            </div>
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
