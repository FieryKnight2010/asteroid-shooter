
import { useEffect } from 'react';
import { toast } from 'sonner';
import { GameState, Pipe } from '../types/game';
import { GAME_CONSTANTS } from '../constants/gameConstants';

interface UseGameLoopProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  generatePipe: () => Pipe;
  checkCollision: (birdY: number, pipes: Pipe[]) => boolean;
  gameLoopRef: React.MutableRefObject<number | undefined>;
}

export const useGameLoop = ({
  gameState,
  setGameState,
  generatePipe,
  checkCollision,
  gameLoopRef,
}: UseGameLoopProps) => {
  // Main game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const gameLoop = () => {
      setGameState(prev => {
        const newY = prev.birdY + prev.birdVelocity;
        const newVelocity = prev.birdVelocity + GAME_CONSTANTS.GRAVITY;

        let newPipes = prev.pipes.map(pipe => ({
          ...pipe,
          x: pipe.x - GAME_CONSTANTS.PIPE_SPEED
        })).filter(pipe => pipe.x + GAME_CONSTANTS.PIPE_WIDTH > 0);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_CONSTANTS.GAME_WIDTH - 300) {
          newPipes.push(generatePipe());
        }

        // Check for score
        let newScore = prev.score;
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + GAME_CONSTANTS.PIPE_WIDTH < GAME_CONSTANTS.GAME_WIDTH / 2 - GAME_CONSTANTS.BIRD_SIZE / 2) {
            pipe.passed = true;
            newScore += 1;
            if (newScore % 5 === 0) {
              toast(`Great job! Score: ${newScore}`, {
                duration: 1000,
              });
            }
          }
        });

        return {
          ...prev,
          birdY: newY,
          birdVelocity: newVelocity,
          pipes: newPipes,
          score: newScore,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStarted, gameState.gameOver, generatePipe, setGameState, gameLoopRef]);

  // Collision checking
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      if (checkCollision(gameState.birdY, gameState.pipes)) {
        setGameState(prev => ({ ...prev, gameOver: true }));
        toast.error("Game Over! Tap to play again");
      }
    }
  }, [gameState.birdY, gameState.pipes, gameState.gameStarted, gameState.gameOver, checkCollision, setGameState]);
};
