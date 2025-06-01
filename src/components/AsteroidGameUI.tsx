
import React from 'react';
import { Play, RotateCcw, List } from 'lucide-react';
import { GameState } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface AsteroidGameUIProps {
  gameState: GameState;
  selectedLevel: number;
  onStart: () => void;
  onRestart: () => void;
  onShowLevelMenu: () => void;
  getScoreForLevel: (level: number) => number;
}

const AsteroidGameUI: React.FC<AsteroidGameUIProps> = ({ 
  gameState, 
  selectedLevel,
  onStart, 
  onRestart,
  onShowLevelMenu,
  getScoreForLevel
}) => {
  // Determine what asteroid types are available at current level
  const getAvailableTypes = (level: number) => {
    const types = [];
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.normal) types.push('Normal');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.fast) types.push('Fast');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.armored) types.push('Armored');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.explosive) types.push('Explosive');
    return types;
  };

  const availableTypes = getAvailableTypes(gameState.level);
  const requiredScore = getScoreForLevel(gameState.level);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score and Lives */}
      {gameState.gameStarted && (
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-black bg-opacity-50 p-3 rounded">
            <div className="text-lg font-bold">Score: {gameState.score}/{requiredScore}</div>
            <div className="text-sm">Lives: {gameState.lives}</div>
            <div className="text-sm">Level: {gameState.level}/{GAME_CONSTANTS.MAX_LEVELS}</div>
            
            {/* Progress bar for level completion */}
            <div className="mt-2 w-32 h-2 bg-gray-600 rounded">
              <div 
                className="h-full bg-green-500 rounded transition-all duration-300"
                style={{ width: `${Math.min(100, (gameState.score / requiredScore) * 100)}%` }}
              />
            </div>
            
            {/* Available asteroid types */}
            <div className="mt-2">
              <div className="text-xs text-gray-300">Active Types:</div>
              <div className="text-xs">{availableTypes.join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameState.gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-8 rounded-xl text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Asteroid Shooter</h1>
            <p className="mb-4">30 levels of asteroid-blasting action!</p>
            <p className="mb-6 text-sm text-gray-300">
              Selected Level: {selectedLevel} • Score needed: {getScoreForLevel(selectedLevel)}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={onStart}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto"
              >
                <Play size={20} />
                Start Level {selectedLevel}
              </button>
              
              <button 
                onClick={onShowLevelMenu}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto"
              >
                <List size={20} />
                Select Level
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameState.gameOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-80 p-8 rounded-xl text-center text-white">
            <h2 className="text-3xl font-bold text-red-500 mb-4">
              {gameState.level >= GAME_CONSTANTS.MAX_LEVELS ? 'Game Complete!' : 'Game Over!'}
            </h2>
            <div className="mb-6">
              <p className="text-lg mb-2">Final Score: {gameState.score}</p>
              <p className="text-md mb-2">Level Reached: {gameState.level}</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={onRestart}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto"
              >
                <RotateCcw size={20} />
                Restart Level
              </button>
              
              <button 
                onClick={onShowLevelMenu}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 pointer-events-auto"
              >
                <List size={20} />
                Level Menu
              </button>
            </div>
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
