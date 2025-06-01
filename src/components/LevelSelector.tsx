
import React from 'react';
import { Lock, Star } from 'lucide-react';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface LevelSelectorProps {
  currentLevel: number;
  unlockedLevels: number;
  onLevelSelect: (level: number) => void;
  onBack: () => void;
  getScoreForLevel: (level: number) => number;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  unlockedLevels,
  onLevelSelect,
  onBack,
  getScoreForLevel
}) => {
  const renderLevelButton = (level: number) => {
    const isUnlocked = level <= unlockedLevels;
    const isCurrent = level === currentLevel;
    const requiredScore = getScoreForLevel(level);
    
    // Determine what asteroid types are available at this level
    const availableTypes = [];
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.normal) availableTypes.push('Normal');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.fast) availableTypes.push('Fast');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.armored) availableTypes.push('Armored');
    if (level >= GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.explosive) availableTypes.push('Explosive');

    return (
      <div key={level} className="relative group">
        <button
          onClick={() => isUnlocked && onLevelSelect(level)}
          disabled={!isUnlocked}
          className={`
            w-20 h-20 rounded-lg font-bold text-sm transition-all duration-200 flex flex-col items-center justify-center
            ${isUnlocked 
              ? isCurrent 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:scale-105'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isUnlocked ? (
            <div className="flex flex-col items-center">
              <span className="text-lg">{level}</span>
              <span className="text-xs">{requiredScore}pts</span>
              {isCurrent && <Star size={12} className="mt-1" />}
            </div>
          ) : (
            <Lock size={20} />
          )}
        </button>
        
        {/* Tooltip on hover */}
        {isUnlocked && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            <div>Level {level} - {requiredScore} points needed</div>
            <div className="text-xs text-gray-300">{availableTypes.join(', ')}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Select Level</h2>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
        
        <div className="grid grid-cols-6 gap-4 mb-6">
          {Array.from({ length: GAME_CONSTANTS.MAX_LEVELS }, (_, i) => i + 1).map(renderLevelButton)}
        </div>
        
        <div className="text-white text-sm space-y-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Progress: {unlockedLevels}/{GAME_CONSTANTS.MAX_LEVELS} levels unlocked</span>
          </div>
          <div className="text-xs text-gray-400">
            <p>• Each level requires reaching a score target (1000 points per level)</p>
            <p>• Each level gives you {GAME_CONSTANTS.LIVES_PER_LEVEL} lives</p>
            <p>• New asteroid types unlock as you progress:</p>
            <p className="ml-4">
              Fast asteroids (Level {GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.fast}+), 
              Armored asteroids (Level {GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.armored}+), 
              Explosive asteroids (Level {GAME_CONSTANTS.ASTEROID_TYPE_LEVELS.explosive}+)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;
