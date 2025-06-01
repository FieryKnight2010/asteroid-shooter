import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { GameState, Spaceship, Bullet, Asteroid, Position, Velocity } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

const createInitialSpaceship = (): Spaceship => ({
  position: { 
    x: GAME_CONSTANTS.CANVAS_WIDTH / 2, 
    y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 
  },
  rotation: 0,
  velocity: { x: 0, y: 0 },
  isThrusting: false,
});

const createInitialGameState = (): GameState => ({
  spaceship: createInitialSpaceship(),
  bullets: [],
  asteroids: [],
  score: 0,
  level: 1,
  lives: GAME_CONSTANTS.INITIAL_LIVES,
  gameOver: false,
  gameStarted: false,
  paused: false,
});

export const useAsteroidGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const gameLoopRef = useRef<number>();
  const bulletIdRef = useRef(0);
  const asteroidIdRef = useRef(0);

  const wrapPosition = (position: Position): Position => ({
    x: ((position.x % GAME_CONSTANTS.CANVAS_WIDTH) + GAME_CONSTANTS.CANVAS_WIDTH) % GAME_CONSTANTS.CANVAS_WIDTH,
    y: ((position.y % GAME_CONSTANTS.CANVAS_HEIGHT) + GAME_CONSTANTS.CANVAS_HEIGHT) % GAME_CONSTANTS.CANVAS_HEIGHT,
  });

  const createAsteroid = (position: Position, size: 'large' | 'medium' | 'small'): Asteroid => {
    const speed = GAME_CONSTANTS.ASTEROID_SPEEDS[size];
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * (speed.max - speed.min) + speed.min;
    
    return {
      id: asteroidIdRef.current++,
      position,
      velocity: {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
      },
      size,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };
  };

  const createRandomAsteroid = (): Asteroid => {
    const edge = Math.floor(Math.random() * 4);
    let position: Position;
    
    switch (edge) {
      case 0: // Top
        position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: -50 };
        break;
      case 1: // Right
        position = { x: GAME_CONSTANTS.CANVAS_WIDTH + 50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT };
        break;
      case 2: // Bottom
        position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: GAME_CONSTANTS.CANVAS_HEIGHT + 50 };
        break;
      default: // Left
        position = { x: -50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT };
    }
    
    return createAsteroid(position, 'large');
  };

  const generateAsteroids = (level: number): Asteroid[] => {
    const count = Math.min(
      GAME_CONSTANTS.BASE_ASTEROIDS + (level - 1) * GAME_CONSTANTS.ASTEROIDS_PER_LEVEL,
      GAME_CONSTANTS.MAX_ASTEROIDS
    );
    
    return Array.from({ length: count }, () => createRandomAsteroid());
  };

  const startGame = useCallback(() => {
    const newGameState = createInitialGameState();
    newGameState.gameStarted = true;
    newGameState.asteroids = generateAsteroids(1);
    setGameState(newGameState);
    toast.success("Game started! Destroy the asteroids!");
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, paused: !prev.paused }));
  }, []);

  const shoot = useCallback(() => {
    setGameState(prev => {
      if (prev.bullets.length >= GAME_CONSTANTS.MAX_BULLETS || prev.gameOver || !prev.gameStarted) {
        return prev;
      }

      const { spaceship } = prev;
      // Calculate bullet spawn position at the tip of the spaceship
      const tipOffset = GAME_CONSTANTS.SPACESHIP_SIZE / 2;
      const bulletStartX = spaceship.position.x + Math.cos(spaceship.rotation) * tipOffset;
      const bulletStartY = spaceship.position.y + Math.sin(spaceship.rotation) * tipOffset;
      
      const bullet: Bullet = {
        id: bulletIdRef.current++,
        position: { x: bulletStartX, y: bulletStartY },
        velocity: {
          x: Math.cos(spaceship.rotation) * GAME_CONSTANTS.BULLET_SPEED,
          y: Math.sin(spaceship.rotation) * GAME_CONSTANTS.BULLET_SPEED,
        },
        lifespan: GAME_CONSTANTS.BULLET_LIFESPAN,
      };

      return {
        ...prev,
        bullets: [...prev.bullets, bullet],
      };
    });
  }, []);

  const updateSpaceship = useCallback((controls: any) => {
    setGameState(prev => {
      const { spaceship } = prev;
      let newRotation = spaceship.rotation;
      let newVelocity = { ...spaceship.velocity };

      // Rotation
      if (controls.left) newRotation -= GAME_CONSTANTS.SPACESHIP_ROTATION_SPEED;
      if (controls.right) newRotation += GAME_CONSTANTS.SPACESHIP_ROTATION_SPEED;

      // Forward/backward movement in the direction of pointing
      if (controls.thrust) {
        newVelocity.x += Math.cos(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST;
        newVelocity.y += Math.sin(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST;
      }

      // Reverse thrust (S key)
      if (controls.reverse) {
        newVelocity.x -= Math.cos(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST * 0.7;
        newVelocity.y -= Math.sin(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST * 0.7;
      }

      // Apply friction and speed limit
      newVelocity.x *= GAME_CONSTANTS.SPACESHIP_FRICTION;
      newVelocity.y *= GAME_CONSTANTS.SPACESHIP_FRICTION;

      const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
      if (speed > GAME_CONSTANTS.SPACESHIP_MAX_SPEED) {
        newVelocity.x = (newVelocity.x / speed) * GAME_CONSTANTS.SPACESHIP_MAX_SPEED;
        newVelocity.y = (newVelocity.y / speed) * GAME_CONSTANTS.SPACESHIP_MAX_SPEED;
      }

      // Update position
      const newPosition = {
        x: spaceship.position.x + newVelocity.x,
        y: spaceship.position.y + newVelocity.y,
      };

      return {
        ...prev,
        spaceship: {
          ...spaceship,
          position: wrapPosition(newPosition),
          rotation: newRotation,
          velocity: newVelocity,
          isThrusting: controls.thrust,
        },
      };
    });
  }, []);

  const updateBullets = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bullets: prev.bullets
        .map(bullet => ({
          ...bullet,
          position: wrapPosition({
            x: bullet.position.x + bullet.velocity.x,
            y: bullet.position.y + bullet.velocity.y,
          }),
          lifespan: bullet.lifespan - 1,
        }))
        .filter(bullet => bullet.lifespan > 0),
    }));
  }, []);

  const updateAsteroids = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      asteroids: prev.asteroids.map(asteroid => ({
        ...asteroid,
        position: wrapPosition({
          x: asteroid.position.x + asteroid.velocity.x,
          y: asteroid.position.y + asteroid.velocity.y,
        }),
        rotation: asteroid.rotation + asteroid.rotationSpeed,
      })),
    }));
  }, []);

  const checkCollisions = useCallback(() => {
    setGameState(prev => {
      let newBullets = [...prev.bullets];
      let newAsteroids = [...prev.asteroids];
      let newScore = prev.score;
      let newLevel = prev.level;
      let newLives = prev.lives;
      let gameOver = false;

      // Bullet-asteroid collisions
      for (let i = newBullets.length - 1; i >= 0; i--) {
        const bullet = newBullets[i];
        
        for (let j = newAsteroids.length - 1; j >= 0; j--) {
          const asteroid = newAsteroids[j];
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          
          const distance = Math.sqrt(
            (bullet.position.x - asteroid.position.x) ** 2 +
            (bullet.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < asteroidSize / 2) {
            // Remove bullet and asteroid
            newBullets.splice(i, 1);
            const hitAsteroid = newAsteroids.splice(j, 1)[0];
            
            // Add score
            newScore += GAME_CONSTANTS.POINTS[hitAsteroid.size];
            
            // Split asteroid if large or medium
            if (hitAsteroid.size === 'large') {
              for (let k = 0; k < 2; k++) {
                newAsteroids.push(createAsteroid(hitAsteroid.position, 'medium'));
              }
            } else if (hitAsteroid.size === 'medium') {
              for (let k = 0; k < 2; k++) {
                newAsteroids.push(createAsteroid(hitAsteroid.position, 'small'));
              }
            }
            
            break;
          }
        }
      }

      // Spaceship-asteroid collisions
      for (const asteroid of newAsteroids) {
        const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
        const distance = Math.sqrt(
          (prev.spaceship.position.x - asteroid.position.x) ** 2 +
          (prev.spaceship.position.y - asteroid.position.y) ** 2
        );
        
        if (distance < (asteroidSize / 2 + GAME_CONSTANTS.SPACESHIP_SIZE / 2)) {
          newLives--;
          if (newLives <= 0) {
            gameOver = true;
            toast.error(`Game Over! Final Score: ${newScore}`);
          } else {
            toast.warning(`Hit! Lives remaining: ${newLives}`);
          }
          break;
        }
      }

      // Check level progression
      if (newAsteroids.length === 0 && !gameOver) {
        newLevel++;
        newAsteroids = generateAsteroids(newLevel);
        toast.success(`Level ${newLevel}! More asteroids incoming!`);
      }

      return {
        ...prev,
        bullets: newBullets,
        asteroids: newAsteroids,
        score: newScore,
        level: newLevel,
        lives: newLives,
        gameOver,
        spaceship: gameOver ? createInitialSpaceship() : prev.spaceship,
      };
    });
  }, []);

  return {
    gameState,
    startGame,
    restartGame,
    pauseGame,
    shoot,
    updateSpaceship,
    updateBullets,
    updateAsteroids,
    checkCollisions,
    gameLoopRef,
  };
};
