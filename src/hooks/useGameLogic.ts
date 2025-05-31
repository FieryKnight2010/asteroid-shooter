
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { GameState, Pipe } from '../types/game';
import { GAME_CONSTANTS } from '../constants/gameConstants';

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    gameOver: false,
    score: 0,
    birdY: 300,
    birdVelocity: 0,
    pipes: [],
    showInstructions: true,
  });
  
  const gameLoopRef = useRef<number>();
  const pipeIdRef = useRef(0);

  const jump = useCallback(() => {
    if (!gameState.gameStarted && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        showInstructions: false,
      }));
      toast("Game started! Tap to flap!");
    }
    
    if (gameState.gameStarted && !gameState.gameOver) {
      setGameState(prev => ({
        ...prev,
        birdVelocity: GAME_CONSTANTS.JUMP_STRENGTH,
      }));
    }
  }, [gameState.gameStarted, gameState.gameOver]);

  const resetGame = useCallback(() => {
    setGameState({
      gameStarted: false,
      gameOver: false,
      score: 0,
      birdY: 300,
      birdVelocity: 0,
      pipes: [],
      showInstructions: true,
    });
    pipeIdRef.current = 0;
  }, []);

  const generatePipe = useCallback((): Pipe => {
    const minGapTop = 100;
    const maxGapTop = GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.PIPE_GAP - GAME_CONSTANTS.GROUND_HEIGHT - 100;
    const gapTop = Math.random() * (maxGapTop - minGapTop) + minGapTop;
    
    return {
      id: pipeIdRef.current++,
      x: GAME_CONSTANTS.GAME_WIDTH,
      height: gapTop,
      passed: false
    };
  }, []);

  const checkCollision = useCallback((birdY: number, pipes: Pipe[]) => {
    // Ground collision
    if (birdY + GAME_CONSTANTS.BIRD_SIZE > GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.GROUND_HEIGHT) {
      return true;
    }
    
    // Ceiling collision
    if (birdY < 0) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const birdLeft = GAME_CONSTANTS.GAME_WIDTH / 2 - GAME_CONSTANTS.BIRD_SIZE / 2;
      const birdRight = GAME_CONSTANTS.GAME_WIDTH / 2 + GAME_CONSTANTS.BIRD_SIZE / 2;
      const birdTop = birdY;
      const birdBottom = birdY + GAME_CONSTANTS.BIRD_SIZE;

      if (birdRight > pipe.x && birdLeft < pipe.x + GAME_CONSTANTS.PIPE_WIDTH) {
        if (birdTop < pipe.height) {
          return true;
        }
        
        const bottomPipeTop = pipe.height + GAME_CONSTANTS.PIPE_GAP;
        if (birdBottom > bottomPipeTop) {
          return true;
        }
      }
    }

    return false;
  }, []);

  return {
    gameState,
    setGameState,
    jump,
    resetGame,
    generatePipe,
    checkCollision,
    gameLoopRef,
  };
};
