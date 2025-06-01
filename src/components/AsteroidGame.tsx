
import React from 'react';
import { useAsteroidGameLogic } from '../hooks/useAsteroidGameLogic';
import { useAsteroidControls } from '../hooks/useAsteroidControls';
import { useAsteroidGameLoop } from '../hooks/useAsteroidGameLoop';
import Spaceship from './Spaceship';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import AsteroidGameUI from './AsteroidGameUI';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

const AsteroidGame = () => {
  const {
    gameState,
    isInvulnerable,
    spaceshipVisible,
    startGame,
    restartGame,
    pauseGame,
    shoot,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    gameLoopRef,
  } = useAsteroidGameLogic();

  const controls = useAsteroidControls({ shoot, pauseGame });

  useAsteroidGameLoop({
    gameState,
    controls,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    gameLoopRef,
  });

  const handleClick = () => {
    if (!gameState.gameStarted) {
      startGame();
    } else if (gameState.gameOver) {
      restartGame();
    }
  };

  return (
    <div className="relative">
      <div 
        className="relative bg-black border-4 border-gray-600 rounded-lg shadow-2xl cursor-crosshair overflow-hidden"
        style={{ 
          width: GAME_CONSTANTS.CANVAS_WIDTH, 
          height: GAME_CONSTANTS.CANVAS_HEIGHT,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
        onClick={handleClick}
      >
        {/* Spaceship */}
        {gameState.gameStarted && !gameState.gameOver && spaceshipVisible && (
          <div className={isInvulnerable ? 'animate-pulse' : ''}>
            <Spaceship 
              spaceship={gameState.spaceship}
              isThrusting={controls.thrust}
            />
          </div>
        )}
        
        {/* Bullets */}
        {gameState.bullets.map(bullet => (
          <Bullet key={bullet.id} bullet={bullet} />
        ))}
        
        {/* Asteroids */}
        {gameState.asteroids.map(asteroid => (
          <Asteroid key={asteroid.id} asteroid={asteroid} />
        ))}
        
        {/* Game UI */}
        <AsteroidGameUI 
          gameState={gameState}
          onStart={startGame}
          onRestart={restartGame}
        />
      </div>
      
      {/* Controls info */}
      <div className="mt-4 text-white text-center text-sm">
        <p>WASD: Move • Space: Shoot • P: Pause</p>
      </div>
    </div>
  );
};

export default AsteroidGame;
