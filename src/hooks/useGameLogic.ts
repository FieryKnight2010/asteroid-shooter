
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
    // Add more randomization with different ranges for variety
    const GAP_SIZE_MIN = 120;
    const GAP_SIZE_MAX = 180;
    const GAP_TOP_MIN = 80;
    const GAP_TOP_MAX = GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.GROUND_HEIGHT - GAP_SIZE_MAX - 80;
    
    const gapSize = Math.random() * (GAP_SIZE_MAX - GAP_SIZE_MIN) + GAP_SIZE_MIN;
    const gapTop = Math.random() * (GAP_TOP_MAX - GAP_TOP_MIN) + GAP_TOP_MIN;
    
    console.log(`Generated pipe ${pipeIdRef.current}: gapTop=${gapTop}, gapSize=${gapSize}`);
    
    return {
      id: pipeIdRef.current++,
      x: GAME_CONSTANTS.GAME_WIDTH,
      height: gapTop,
      passed: false,
      gapSize: gapSize // Add gap size to pipe data
    };
  }, []);

  const checkCollision = useCallback((birdY: number, pipes: Pipe[]) => {
    // Ground collision
    if (birdY + GAME_CONSTANTS.BIRD_SIZE > GAME_CONSTANTS.GAME_HEIGHT - GAME_CONSTANTS.GROUND_HEIGHT) {
      console.log("Ground collision detected");
      return true;
    }
    
    // Ceiling collision
    if (birdY < 0) {
      console.log("Ceiling collision detected");
      return true;
    }

    // Bird position
    const birdLeft = GAME_CONSTANTS.GAME_WIDTH / 2 - GAME_CONSTANTS.BIRD_SIZE / 2;
    const birdRight = GAME_CONSTANTS.GAME_WIDTH / 2 + GAME_CONSTANTS.BIRD_SIZE / 2;
    const birdTop = birdY;
    const birdBottom = birdY + GAME_CONSTANTS.BIRD_SIZE;

    // Pipe collision - more precise detection
    for (const pipe of pipes) {
      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + GAME_CONSTANTS.PIPE_WIDTH;
      
      // Only check collision if bird overlaps horizontally with pipe
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        const topPipeBottom = pipe.height;
        const bottomPipeTop = pipe.height + (pipe.gapSize || GAME_CONSTANTS.PIPE_GAP);
        
        // Check if bird hits top pipe or bottom pipe
        if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
          console.log(`Pipe collision: bird(${birdTop}-${birdBottom}) vs pipes(top:0-${topPipeBottom}, bottom:${bottomPipeTop}-ground)`);
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
