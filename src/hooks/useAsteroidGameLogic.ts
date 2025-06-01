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
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [spaceshipVisible, setSpaceshipVisible] = useState(true);
  const gameLoopRef = useRef<number>();
  const bulletIdRef = useRef(0);
  const asteroidIdRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const respawnTimerRef = useRef<NodeJS.Timeout>();
  const invulnerabilityTimerRef = useRef<NodeJS.Timeout>();

  const wrapPosition = (position: Position): Position => ({
    x: ((position.x % GAME_CONSTANTS.CANVAS_WIDTH) + GAME_CONSTANTS.CANVAS_WIDTH) % GAME_CONSTANTS.CANVAS_WIDTH,
    y: ((position.y % GAME_CONSTANTS.CANVAS_HEIGHT) + GAME_CONSTANTS.CANVAS_HEIGHT) % GAME_CONSTANTS.CANVAS_HEIGHT,
  });

  const makeInvulnerable = useCallback(() => {
    setIsInvulnerable(true);
    if (invulnerabilityTimerRef.current) {
      clearTimeout(invulnerabilityTimerRef.current);
    }
    invulnerabilityTimerRef.current = setTimeout(() => {
      setIsInvulnerable(false);
    }, 2000); // 2 seconds of invulnerability
  }, []);

  const respawnSpaceship = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      spaceship: createInitialSpaceship(),
    }));
    setSpaceshipVisible(true);
    makeInvulnerable();
  }, [makeInvulnerable]);

  const handleSpaceshipHit = useCallback(() => {
    setGameState(prev => {
      const newLives = prev.lives - 1;
      
      if (newLives <= 0) {
        toast.error(`Game Over! Final Score: ${prev.score}`);
        return {
          ...prev,
          lives: 0,
          gameOver: true,
        };
      } else {
        toast.warning(`Hit! Lives remaining: ${newLives}`);
        
        // Hide spaceship immediately
        setSpaceshipVisible(false);
        
        // Schedule respawn after a brief delay
        if (respawnTimerRef.current) {
          clearTimeout(respawnTimerRef.current);
        }
        respawnTimerRef.current = setTimeout(() => {
          respawnSpaceship();
        }, 1000); // 1 second delay before respawn
        
        return {
          ...prev,
          lives: newLives,
        };
      }
    });
  }, [respawnSpaceship]);

  const createAsteroid = (position: Position, size: 'large' | 'medium' | 'small'): Asteroid => {
    // Calculate speed multiplier based on game time
    const currentTime = Date.now();
    const timeElapsed = (currentTime - gameStartTimeRef.current) / 1000; // seconds
    const speedMultiplier = 1 + (timeElapsed * 0.05); // 5% speed increase per second
    
    const speed = GAME_CONSTANTS.ASTEROID_SPEEDS[size];
    const angle = Math.random() * Math.PI * 2;
    const baseVelocity = Math.random() * (speed.max - speed.min) + speed.min;
    const finalVelocity = baseVelocity * speedMultiplier;
    
    return {
      id: asteroidIdRef.current++,
      position,
      velocity: {
        x: Math.cos(angle) * finalVelocity,
        y: Math.sin(angle) * finalVelocity,
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
    
    // Randomly select asteroid size with weighted probability
    const sizeRandom = Math.random();
    let size: 'large' | 'medium' | 'small';
    
    if (sizeRandom < 0.5) {
      size = 'large';
    } else if (sizeRandom < 0.8) {
      size = 'medium';
    } else {
      size = 'small';
    }
    
    return createAsteroid(position, size);
  };

  const spawnAsteroid = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver || prev.paused) {
        return prev;
      }

      // Calculate spawn rate based on time elapsed
      const currentTime = Date.now();
      const timeElapsed = (currentTime - gameStartTimeRef.current) / 1000; // seconds
      const baseSpawnRate = 180; // frames between spawns at start (3 seconds at 60fps)
      const minSpawnRate = 30; // minimum frames between spawns (0.5 seconds at 60fps)
      const spawnRate = Math.max(minSpawnRate, baseSpawnRate - timeElapsed * 2);

      spawnTimerRef.current++;
      
      if (spawnTimerRef.current >= spawnRate) {
        spawnTimerRef.current = 0;
        return {
          ...prev,
          asteroids: [...prev.asteroids, createRandomAsteroid()],
        };
      }

      return prev;
    });
  }, []);

  const startGame = useCallback(() => {
    const newGameState = createInitialGameState();
    newGameState.gameStarted = true;
    newGameState.asteroids = [createRandomAsteroid()]; // Start with one asteroid
    gameStartTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
    setGameState(newGameState);
    setIsInvulnerable(false);
    setSpaceshipVisible(true);
    toast.success("Game started! Destroy the asteroids!");
  }, []);

  const restartGame = useCallback(() => {
    if (respawnTimerRef.current) {
      clearTimeout(respawnTimerRef.current);
    }
    if (invulnerabilityTimerRef.current) {
      clearTimeout(invulnerabilityTimerRef.current);
    }
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
      // Calculate bullet spawn position at the back of the spaceship (opposite direction)
      const backOffset = GAME_CONSTANTS.SPACESHIP_SIZE / 2;
      const bulletStartX = spaceship.position.x - Math.cos(spaceship.rotation) * backOffset;
      const bulletStartY = spaceship.position.y - Math.sin(spaceship.rotation) * backOffset;
      
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
    
    // Spawn new asteroids
    spawnAsteroid();
  }, [spawnAsteroid]);

  const checkCollisions = useCallback(() => {
    setGameState(prev => {
      let newBullets = [...prev.bullets];
      let newAsteroids = [...prev.asteroids];
      let newScore = prev.score;

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
            // Remove bullet and asteroid (no splitting)
            newBullets.splice(i, 1);
            newAsteroids.splice(j, 1);
            
            // Add score
            newScore += GAME_CONSTANTS.POINTS[asteroid.size];
            
            break;
          }
        }
      }

      // Spaceship-asteroid collisions (only if not invulnerable and spaceship is visible)
      if (!isInvulnerable && spaceshipVisible && !prev.gameOver) {
        for (const asteroid of newAsteroids) {
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          const distance = Math.sqrt(
            (prev.spaceship.position.x - asteroid.position.x) ** 2 +
            (prev.spaceship.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < (asteroidSize / 2 + GAME_CONSTANTS.SPACESHIP_SIZE / 2)) {
            // Trigger hit handling
            handleSpaceshipHit();
            break; // Only process one collision per frame
          }
        }
      }

      return {
        ...prev,
        bullets: newBullets,
        asteroids: newAsteroids,
        score: newScore,
      };
    });
  }, [isInvulnerable, spaceshipVisible, handleSpaceshipHit]);

  return {
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
  };
};
