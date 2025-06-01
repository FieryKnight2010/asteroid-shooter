
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
  updateParticles: () => void;
  createExplosion: (x: number, y: number, color?: string, count?: number) => void;
  createTrail: (x: number, y: number, vx: number, vy: number) => void;
}

export const useAsteroidGameLoop = ({
  gameState,
  controls,
  updateSpaceship,
  updateBullets,
  updateAsteroids,
  checkCollisions,
  gameLoopRef,
  updateParticles,
  createExplosion,
  createTrail,
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
      updateParticles();
      
      // Create thrust particles when thrusting
      if (controls.thrust && gameState.spaceship) {
        const thrustX = gameState.spaceship.position.x - Math.cos(gameState.spaceship.rotation) * 15;
        const thrustY = gameState.spaceship.position.y - Math.sin(gameState.spaceship.rotation) * 15;
        createTrail(thrustX, thrustY, -gameState.spaceship.velocity.x, -gameState.spaceship.velocity.y);
      }
      
      // Create bullet trails
      gameState.bullets.forEach(bullet => {
        if (Math.random() < 0.3) {
          createTrail(bullet.position.x, bullet.position.y, bullet.velocity.x, bullet.velocity.y);
        }
      });
      
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
    gameState.spaceship,
    gameState.bullets,
    controls,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    gameLoopRef,
    updateParticles,
    createExplosion,
    createTrail,
  ]);
};
