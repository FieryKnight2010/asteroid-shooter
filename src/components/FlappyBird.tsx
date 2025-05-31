
import React from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import GameUI from './GameUI';
import GameBackground from './GameBackground';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { GAME_CONSTANTS } from '../constants/gameConstants';

const FlappyBird = () => {
  const {
    gameState,
    setGameState,
    jump,
    resetGame,
    generatePipe,
    checkCollision,
    gameLoopRef,
  } = useGameLogic();

  useGameLoop({
    gameState,
    setGameState,
    generatePipe,
    checkCollision,
    gameLoopRef,
  });

  useKeyboardControls({
    jump,
    resetGame,
    gameOver: gameState.gameOver,
  });

  const handleClick = () => {
    if (gameState.gameOver) {
      resetGame();
    } else {
      jump();
    }
  };

  return (
    <div className="relative">
      <div 
        className="relative bg-gradient-to-b from-sky-400 to-sky-300 border-4 border-sky-600 rounded-lg shadow-2xl cursor-pointer overflow-hidden"
        style={{ width: GAME_CONSTANTS.GAME_WIDTH, height: GAME_CONSTANTS.GAME_HEIGHT }}
        onClick={handleClick}
      >
        <GameBackground />
        
        {/* Pipes */}
        {gameState.pipes.map(pipe => (
          <Pipe 
            key={pipe.id} 
            x={pipe.x} 
            height={pipe.height} 
            gap={GAME_CONSTANTS.PIPE_GAP} 
            groundHeight={GAME_CONSTANTS.GROUND_HEIGHT} 
            gameHeight={GAME_CONSTANTS.GAME_HEIGHT} 
          />
        ))}
        
        {/* Bird */}
        <Bird 
          y={gameState.birdY} 
          velocity={gameState.birdVelocity}
          gameStarted={gameState.gameStarted}
          gameOver={gameState.gameOver}
        />
        
        {/* Game UI */}
        <GameUI 
          score={gameState.score}
          gameStarted={gameState.gameStarted}
          gameOver={gameState.gameOver}
          showInstructions={gameState.showInstructions}
          onRestart={resetGame}
        />
      </div>
    </div>
  );
};

export default FlappyBird;
