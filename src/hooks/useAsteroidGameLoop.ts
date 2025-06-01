
import { useEffect } from 'react';
import { GameState, Controls } from '../types/asteroidGame';

interface UseAsteroidGameLoopProps {
  gameState: GameState;
  controls: Controls;
  updateSpaceship: (controls: Controls) => void;
  updateBullets: () => void;
  updateAsteroids: () => void;
  checkCollisions: () => void;
  gameLoopRef: React.MutableRefObject<number | undefined>;
}

export const useAsteroidGameLoop = ({
  gameState,
  controls,
  updateSpaceship,
  updateBullets,
  updateAsteroids,
  checkCollisions,
  gameLoopRef,
}: UseAsteroidGameLoopProps) => {
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.paused) {
      return;
    }

    const gameLoop = () => {
      updateSpaceship(controls);
      updateBullets();
      updateAsteroids();
      checkCollisions();
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    gameState.gameStarted,
    gameState.gameOver,
    gameState.paused,
    controls,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    gameLoopRef,
  ]);
};
