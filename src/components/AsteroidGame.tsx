
import React from 'react';
import { useAsteroidGameLogic } from '../hooks/useAsteroidGameLogic';
import { useAsteroidControls } from '../hooks/useAsteroidControls';
import { useAsteroidGameLoop } from '../hooks/useAsteroidGameLoop';
import { useParticleSystem } from '../hooks/useParticleSystem';
import Spaceship from './Spaceship';
import Asteroid from './Asteroid';
import Bullet from './Bullet';
import AsteroidGameUI from './AsteroidGameUI';
import LevelSelector from './LevelSelector';
import Starfield from './Starfield';
import ParticleEffect from './ParticleEffect';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

const AsteroidGame = () => {
  const {
    gameState,
    isInvulnerable,
    spaceshipVisible,
    selectedLevel,
    unlockedLevels,
    showLevelSelector,
    startGame,
    restartGame,
    pauseGame,
    shoot,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    selectLevel,
    showLevelMenu,
    hideLevelMenu,
    gameLoopRef,
  } = useAsteroidGameLogic();

  const { particles, createExplosion, createTrail, updateParticles } = useParticleSystem();

  const controls = useAsteroidControls({ shoot, pauseGame });

  useAsteroidGameLoop({
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
          background: 'radial-gradient(ellipse at center, #0a0a23 0%, #000 70%)',
        }}
        onClick={handleClick}
      >
        {/* Starfield Background */}
        <Starfield />
        
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
        
        {/* Particle Effects */}
        <ParticleEffect particles={particles} />
        
        {/* Level Selector */}
        {showLevelSelector && (
          <LevelSelector
            currentLevel={selectedLevel}
            unlockedLevels={unlockedLevels}
            onLevelSelect={selectLevel}
            onBack={hideLevelMenu}
          />
        )}
        
        {/* Game UI */}
        {!showLevelSelector && (
          <AsteroidGameUI 
            gameState={gameState}
            selectedLevel={selectedLevel}
            onStart={startGame}
            onRestart={restartGame}
            onShowLevelMenu={showLevelMenu}
          />
        )}
      </div>
      
      {/* Controls info */}
      <div className="mt-4 text-white text-center text-sm">
        <p>WASD: Move • Space: Shoot • P: Pause</p>
        <p className="text-xs mt-1">
          Asteroid types unlock as you progress: Fast (L8), Armored (L15), Explosive (L22)
        </p>
      </div>
    </div>
  );
};

export default AsteroidGame;

