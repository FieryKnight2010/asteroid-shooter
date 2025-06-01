
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { GameState, Spaceship, Bullet, Asteroid, Position } from '../types/asteroidGame';
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
  const fireRateTimerRef = useRef(0);
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
    }, 2000);
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
        
        setSpaceshipVisible(false);
        
        if (respawnTimerRef.current) {
          clearTimeout(respawnTimerRef.current);
        }
        respawnTimerRef.current = setTimeout(() => {
          respawnSpaceship();
        }, 1000);
        
        return {
          ...prev,
          lives: newLives,
        };
      }
    });
  }, [respawnSpaceship]);

  const createAsteroid = (position: Position, size: 'large' | 'medium' | 'small', type?: Asteroid['type']): Asteroid => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - gameStartTimeRef.current) / 1000;
    const levelSpeedMultiplier = 1 + (gameState.level - 1) * GAME_CONSTANTS.SPEED_INCREASE_PER_LEVEL;
    const timeSpeedMultiplier = 1 + (timeElapsed * 0.05);
    
    const asteroidType = type || (['normal', 'fast', 'armored', 'explosive'][Math.floor(Math.random() * 4)] as Asteroid['type']);
    const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroidType];
    
    const speed = GAME_CONSTANTS.ASTEROID_SPEEDS[size];
    const angle = Math.random() * Math.PI * 2;
    const baseVelocity = Math.random() * (speed.max - speed.min) + speed.min;
    const finalVelocity = baseVelocity * timeSpeedMultiplier * typeData.speedMultiplier * levelSpeedMultiplier;
    
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
      type: asteroidType,
      health: typeData.health,
      maxHealth: typeData.health,
    };
  };

  const createRandomAsteroid = (): Asteroid => {
    const edge = Math.floor(Math.random() * 4);
    let position: Position;
    
    switch (edge) {
      case 0: position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: -50 }; break;
      case 1: position = { x: GAME_CONSTANTS.CANVAS_WIDTH + 50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT }; break;
      case 2: position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: GAME_CONSTANTS.CANVAS_HEIGHT + 50 }; break;
      default: position = { x: -50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT };
    }
    
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

      const currentTime = Date.now();
      const timeElapsed = (currentTime - gameStartTimeRef.current) / 1000;
      const levelSpawnMultiplier = 1 + (prev.level - 1) * 0.2;
      const baseSpawnRate = 180;
      const minSpawnRate = 20;
      const spawnRate = Math.max(minSpawnRate, baseSpawnRate - (timeElapsed * 2) - (prev.level * 10));

      const maxAsteroidsForLevel = Math.min(
        GAME_CONSTANTS.MAX_ASTEROIDS,
        GAME_CONSTANTS.BASE_ASTEROIDS + (prev.level - 1) * GAME_CONSTANTS.ASTEROIDS_PER_LEVEL
      );

      spawnTimerRef.current++;
      
      if (spawnTimerRef.current >= spawnRate && prev.asteroids.length < maxAsteroidsForLevel) {
        spawnTimerRef.current = 0;
        const newAsteroid = createRandomAsteroid();
        
        return {
          ...prev,
          asteroids: [...prev.asteroids, newAsteroid],
        };
      }

      return prev;
    });
  }, []);

  const checkLevelProgression = useCallback(() => {
    setGameState(prev => {
      const pointsNeeded = prev.level * GAME_CONSTANTS.POINTS_PER_LEVEL;
      
      if (prev.score >= pointsNeeded) {
        const newLevel = prev.level + 1;
        toast.success(`Level Up! Welcome to Level ${newLevel}`);
        
        return {
          ...prev,
          level: newLevel,
        };
      }
      
      return prev;
    });
  }, []);

  const startGame = useCallback(() => {
    const newGameState = createInitialGameState();
    newGameState.gameStarted = true;
    newGameState.asteroids = [createRandomAsteroid()];
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
    console.log('Shoot function called');
    setGameState(prev => {
      console.log('Current game state:', {
        bulletsCount: prev.bullets.length,
        maxBullets: GAME_CONSTANTS.MAX_BULLETS,
        gameOver: prev.gameOver,
        gameStarted: prev.gameStarted,
        fireRateTimer: fireRateTimerRef.current
      });

      if (prev.bullets.length >= GAME_CONSTANTS.MAX_BULLETS || prev.gameOver || !prev.gameStarted) {
        console.log('Cannot shoot - conditions not met');
        return prev;
      }

      // Basic fire rate control
      if (fireRateTimerRef.current > 0) {
        console.log('Fire rate limited, timer:', fireRateTimerRef.current);
        return prev;
      }
      
      fireRateTimerRef.current = 8; // Set cooldown period
      console.log('Creating new bullet');

      const { spaceship } = prev;
      const backOffset = GAME_CONSTANTS.SPACESHIP_SIZE / 2;
      const bulletStartX = spaceship.position.x - Math.cos(spaceship.rotation) * backOffset;
      const bulletStartY = spaceship.position.y - Math.sin(spaceship.rotation) * backOffset;
      
      const newBullet: Bullet = {
        id: bulletIdRef.current++,
        position: { x: bulletStartX, y: bulletStartY },
        velocity: {
          x: Math.cos(spaceship.rotation) * GAME_CONSTANTS.BULLET_SPEED,
          y: Math.sin(spaceship.rotation) * GAME_CONSTANTS.BULLET_SPEED,
        },
        lifespan: GAME_CONSTANTS.BULLET_LIFESPAN,
      };

      console.log('New bullet created:', newBullet);

      return {
        ...prev,
        bullets: [...prev.bullets, newBullet],
      };
    });
  }, []);

  const updateSpaceship = useCallback((controls: any) => {
    setGameState(prev => {
      // Decrement fire rate timer
      if (fireRateTimerRef.current > 0) {
        fireRateTimerRef.current--;
      }

      const { spaceship } = prev;
      let newRotation = spaceship.rotation;
      let newVelocity = { ...spaceship.velocity };

      if (controls.left) newRotation -= GAME_CONSTANTS.SPACESHIP_ROTATION_SPEED;
      if (controls.right) newRotation += GAME_CONSTANTS.SPACESHIP_ROTATION_SPEED;

      if (controls.thrust) {
        newVelocity.x += Math.cos(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST;
        newVelocity.y += Math.sin(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST;
      }

      if (controls.reverse) {
        newVelocity.x -= Math.cos(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST * 0.7;
        newVelocity.y -= Math.sin(newRotation) * GAME_CONSTANTS.SPACESHIP_THRUST * 0.7;
      }

      newVelocity.x *= GAME_CONSTANTS.SPACESHIP_FRICTION;
      newVelocity.y *= GAME_CONSTANTS.SPACESHIP_FRICTION;

      const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
      if (speed > GAME_CONSTANTS.SPACESHIP_MAX_SPEED) {
        newVelocity.x = (newVelocity.x / speed) * GAME_CONSTANTS.SPACESHIP_MAX_SPEED;
        newVelocity.y = (newVelocity.y / speed) * GAME_CONSTANTS.SPACESHIP_MAX_SPEED;
      }

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
    
    spawnAsteroid();
  }, [spawnAsteroid]);

  const checkCollisions = useCallback((createExplosion?: (x: number, y: number, color?: string, count?: number) => void) => {
    setGameState(prev => {
      let newBullets = [...prev.bullets];
      let newAsteroids = [...prev.asteroids];
      let newScore = prev.score;
      let spaceshipHit = false;

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
            newBullets.splice(i, 1);
            
            // Damage asteroid
            const newHealth = asteroid.health - 1;
            
            if (newHealth <= 0) {
              // Destroy asteroid
              newAsteroids.splice(j, 1);
              
              const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroid.type];
              const sizePoints = GAME_CONSTANTS.POINTS[asteroid.size];
              newScore += sizePoints * typeData.points;
              
              // Special effects for explosive asteroids
              if (asteroid.type === 'explosive') {
                // Create explosion animation
                if (createExplosion) {
                  createExplosion(asteroid.position.x, asteroid.position.y, '#ff4400', 15);
                }
                
                // Check if spaceship is within explosion radius
                const spaceshipDistance = Math.sqrt(
                  (prev.spaceship.position.x - asteroid.position.x) ** 2 +
                  (prev.spaceship.position.y - asteroid.position.y) ** 2
                );
                
                if (spaceshipDistance < 100 && !isInvulnerable && spaceshipVisible && !prev.gameOver) {
                  spaceshipHit = true;
                }
                
                // Damage nearby asteroids
                newAsteroids = newAsteroids.map(nearbyAsteroid => {
                  const explosionDistance = Math.sqrt(
                    (nearbyAsteroid.position.x - asteroid.position.x) ** 2 +
                    (nearbyAsteroid.position.y - asteroid.position.y) ** 2
                  );
                  
                  if (explosionDistance < 100) {
                    return { ...nearbyAsteroid, health: Math.max(1, nearbyAsteroid.health - 1) };
                  }
                  return nearbyAsteroid;
                });
              }
            } else {
              // Update asteroid health
              newAsteroids[j] = { ...asteroid, health: newHealth };
            }
            
            break;
          }
        }
      }

      // Spaceship-asteroid collisions (direct contact)
      if (!spaceshipHit && !isInvulnerable && spaceshipVisible && !prev.gameOver) {
        for (const asteroid of newAsteroids) {
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          const distance = Math.sqrt(
            (prev.spaceship.position.x - asteroid.position.x) ** 2 +
            (prev.spaceship.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < (asteroidSize / 2 + GAME_CONSTANTS.SPACESHIP_SIZE / 2)) {
            spaceshipHit = true;
            break;
          }
        }
      }

      // Handle spaceship hit (either from explosion or direct contact)
      if (spaceshipHit) {
        handleSpaceshipHit();
      }

      // Check for level progression after updating score
      const updatedState = {
        ...prev,
        bullets: newBullets,
        asteroids: newAsteroids,
        score: newScore,
      };

      // Check level progression
      const pointsNeeded = updatedState.level * GAME_CONSTANTS.POINTS_PER_LEVEL;
      if (updatedState.score >= pointsNeeded) {
        const newLevel = updatedState.level + 1;
        toast.success(`Level Up! Welcome to Level ${newLevel}`);
        return {
          ...updatedState,
          level: newLevel,
        };
      }

      return updatedState;
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
