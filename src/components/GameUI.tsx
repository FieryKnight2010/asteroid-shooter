
import React from 'react';
import { RotateCcw, Play } from 'lucide-react';

interface GameUIProps {
  score: number;
  gameStarted: boolean;
  gameOver: boolean;
  showInstructions: boolean;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ 
  score, 
  gameStarted, 
  gameOver, 
  showInstructions, 
  onRestart 
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score */}
      {gameStarted && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white bg-opacity-90 px-6 py-3 rounded-full shadow-lg">
            <span className="text-2xl font-bold text-gray-800">{score}</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && !gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl text-center max-w-sm animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Flappy Bird</h1>
            <p className="text-gray-600 mb-6">
              Click or press <kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd> to flap and stay airborne!
            </p>
            <div className="flex items-center justify-center pointer-events-auto">
              <button 
                onClick={onRestart}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Play size={20} />
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl text-center max-w-sm animate-scale-in">
            <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-2">Final Score</p>
              <p className="text-4xl font-bold text-gray-800">{score}</p>
            </div>
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-500">
                Click or press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Space</kbd> to play again
              </p>
            </div>
            <div className="flex items-center justify-center pointer-events-auto">
              <button 
                onClick={onRestart}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <RotateCcw size={20} />
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
