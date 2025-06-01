import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { GameState, Spaceship, Bullet, Asteroid, PowerUp, Position, Velocity } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

const createInitialSpaceship = (): Spaceship => ({
  position: { 
    x: GAME_CONSTANTS.CANVAS_WIDTH / 2, 
    y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 
  },
  rotation: 0,
  velocity: { x: 0, y: 0 },
  isThrusting: false,
  weaponType: 'normal',
  shieldActive: false,
  shieldDuration: 0,
});

const createInitialGameState = (): GameState => ({
  spaceship: createInitialSpaceship(),
  bullets: [],
  asteroids: [],
  powerUps: [],
  score: 0,
  level: 1,
  lives: GAME_CONSTANTS.INITIAL_LIVES,
  gameOver: false,
  gameStarted: false,
  paused: false,
  weaponUpgradeTimer: 0,
});

export const useAsteroidGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [spaceshipVisible, setSpaceshipVisible] = useState(true);
  const gameLoopRef = useRef<number>();
  const bulletIdRef = useRef(0);
  const asteroidIdRef = useRef(0);
  const powerUpIdRef = useRef(0);
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
      if (prev.spaceship.shieldActive) {
        toast.info("Shield absorbed the hit!");
        return {
          ...prev,
          spaceship: {
            ...prev.spaceship,
            shieldActive: false,
            shieldDuration: 0,
          },
        };
      }

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

  const createPowerUp = (position: Position): PowerUp => {
    const types: PowerUp['type'][] = ['rapidFire', 'shield', 'extraLife', 'spreadShot', 'laser'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: powerUpIdRef.current++,
      position,
      velocity: {
        x: (Math.random() - 0.5) * GAME_CONSTANTS.POWERUP_SPEED,
        y: (Math.random() - 0.5) * GAME_CONSTANTS.POWERUP_SPEED,
      },
      type,
      lifespan: GAME_CONSTANTS.POWERUP_LIFESPAN,
    };
  };

  const createAsteroid = (position: Position, size: 'large' | 'medium' | 'small', type?: Asteroid['type']): Asteroid => {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - gameStartTimeRef.current) / 1000;
    const speedMultiplier = 1 + (timeElapsed * 0.05);
    
    const asteroidType = type || (['normal', 'fast', 'armored', 'explosive'][Math.floor(Math.random() * 4)] as Asteroid['type']);
    const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroidType];
    
    const speed = GAME_CONSTANTS.ASTEROID_SPEEDS[size];
    const angle = Math.random() * Math.PI * 2;
    const baseVelocity = Math.random() * (speed.max - speed.min) + speed.min;
    const finalVelocity = baseVelocity * speedMultiplier * typeData.speedMultiplier;
    
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

  const createBossAsteroid = (): Asteroid => {
    const edge = Math.floor(Math.random() * 4);
    let position: Position;
    
    switch (edge) {
      case 0: position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: -50 }; break;
      case 1: position = { x: GAME_CONSTANTS.CANVAS_WIDTH + 50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT }; break;
      case 2: position = { x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH, y: GAME_CONSTANTS.CANVAS_HEIGHT + 50 }; break;
      default: position = { x: -50, y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT };
    }
    
    return createAsteroid(position, 'large', 'boss');
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
      const baseSpawnRate = 180;
      const minSpawnRate = 30;
      const spawnRate = Math.max(minSpawnRate, baseSpawnRate - timeElapsed * 2);

      spawnTimerRef.current++;
      
      if (spawnTimerRef.current >= spawnRate) {
        spawnTimerRef.current = 0;
        
        // 10% chance to spawn boss after 30 seconds
        const shouldSpawnBoss = timeElapsed > 30 && Math.random() < 0.1;
        const newAsteroid = shouldSpawnBoss ? createBossAsteroid() : createRandomAsteroid();
        
        return {
          ...prev,
          asteroids: [...prev.asteroids, newAsteroid],
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
    setGameState(prev => {
      if (prev.bullets.length >= GAME_CONSTANTS.MAX_BULLETS || prev.gameOver || !prev.gameStarted) {
        return prev;
      }

      const weapon = GAME_CONSTANTS.WEAPON_TYPES[prev.spaceship.weaponType];
      
      // Check fire rate
      if (fireRateTimerRef.current < weapon.fireRate) {
        fireRateTimerRef.current++;
        return prev;
      }
      
      fireRateTimerRef.current = 0;

      const { spaceship } = prev;
      const backOffset = GAME_CONSTANTS.SPACESHIP_SIZE / 2;
      const bulletStartX = spaceship.position.x - Math.cos(spaceship.rotation) * backOffset;
      const bulletStartY = spaceship.position.y - Math.sin(spaceship.rotation) * backOffset;
      
      let newBullets: Bullet[] = [];

      if (prev.spaceship.weaponType === 'spread') {
        // Create 3 bullets in a spread pattern
        for (let i = -1; i <= 1; i++) {
          const spreadAngle = spaceship.rotation + (i * 0.3);
          newBullets.push({
            id: bulletIdRef.current++,
            position: { x: bulletStartX, y: bulletStartY },
            velocity: {
              x: Math.cos(spreadAngle) * weapon.speed,
              y: Math.sin(spreadAngle) * weapon.speed,
            },
            lifespan: GAME_CONSTANTS.BULLET_LIFESPAN,
            type: prev.spaceship.weaponType,
            damage: weapon.damage,
          });
        }
      } else {
        newBullets.push({
          id: bulletIdRef.current++,
          position: { x: bulletStartX, y: bulletStartY },
          velocity: {
            x: Math.cos(spaceship.rotation) * weapon.speed,
            y: Math.sin(spaceship.rotation) * weapon.speed,
          },
          lifespan: GAME_CONSTANTS.BULLET_LIFESPAN,
          type: prev.spaceship.weaponType,
          damage: weapon.damage,
        });
      }

      return {
        ...prev,
        bullets: [...prev.bullets, ...newBullets],
      };
    });
  }, []);

  const updateSpaceship = useCallback((controls: any) => {
    setGameState(prev => {
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

      // Update timers
      let newWeaponUpgradeTimer = Math.max(0, prev.weaponUpgradeTimer - 1);
      let newShieldDuration = Math.max(0, spaceship.shieldDuration - 1);
      let newWeaponType = spaceship.weaponType;
      
      if (newWeaponUpgradeTimer === 0 && spaceship.weaponType !== 'normal') {
        newWeaponType = 'normal';
        toast.info("Weapon upgrade expired");
      }

      return {
        ...prev,
        weaponUpgradeTimer: newWeaponUpgradeTimer,
        spaceship: {
          ...spaceship,
          position: wrapPosition(newPosition),
          rotation: newRotation,
          velocity: newVelocity,
          isThrusting: controls.thrust,
          weaponType: newWeaponType,
          shieldActive: newShieldDuration > 0,
          shieldDuration: newShieldDuration,
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

  const updatePowerUps = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      powerUps: prev.powerUps
        .map(powerUp => ({
          ...powerUp,
          position: wrapPosition({
            x: powerUp.position.x + powerUp.velocity.x,
            y: powerUp.position.y + powerUp.velocity.y,
          }),
          lifespan: powerUp.lifespan - 1,
        }))
        .filter(powerUp => powerUp.lifespan > 0),
    }));
  }, []);

  const checkCollisions = useCallback(() => {
    setGameState(prev => {
      let newBullets = [...prev.bullets];
      let newAsteroids = [...prev.asteroids];
      let newPowerUps = [...prev.powerUps];
      let newScore = prev.score;
      let newLives = prev.lives;
      let newSpaceship = { ...prev.spaceship };

      // Bullet-asteroid collisions
      for (let i = newBullets.length - 1; i >= 0; i--) {
        const bullet = newBullets[i];
        
        for (let j = newAsteroids.length - 1; j >= 0; j--) {
          const asteroid = newAsteroids[j];
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          const adjustedSize = asteroid.type === 'boss' ? asteroidSize * 1.5 : asteroidSize;
          
          const distance = Math.sqrt(
            (bullet.position.x - asteroid.position.x) ** 2 +
            (bullet.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < adjustedSize / 2) {
            newBullets.splice(i, 1);
            
            // Damage asteroid
            const newHealth = asteroid.health - bullet.damage;
            
            if (newHealth <= 0) {
              // Destroy asteroid
              newAsteroids.splice(j, 1);
              
              const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroid.type];
              const sizePoints = GAME_CONSTANTS.POINTS[asteroid.size];
              newScore += sizePoints * typeData.points;
              
              // Chance to spawn power-up
              if (Math.random() < GAME_CONSTANTS.POWERUP_SPAWN_CHANCE) {
                newPowerUps.push(createPowerUp(asteroid.position));
              }
              
              // Special effects for explosive asteroids
              if (asteroid.type === 'explosive') {
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

      // Spaceship-powerup collisions
      if (spaceshipVisible && !prev.gameOver) {
        for (let i = newPowerUps.length - 1; i >= 0; i--) {
          const powerUp = newPowerUps[i];
          const distance = Math.sqrt(
            (prev.spaceship.position.x - powerUp.position.x) ** 2 +
            (prev.spaceship.position.y - powerUp.position.y) ** 2
          );
          
          if (distance < GAME_CONSTANTS.POWERUP_SIZE) {
            newPowerUps.splice(i, 1);
            
            switch (powerUp.type) {
              case 'rapidFire':
                newSpaceship.weaponType = 'rapid';
                toast.success("Rapid Fire activated!");
                break;
              case 'shield':
                newSpaceship.shieldActive = true;
                newSpaceship.shieldDuration = GAME_CONSTANTS.SHIELD_DURATION;
                toast.success("Shield activated!");
                break;
              case 'extraLife':
                newLives++;
                toast.success("Extra life gained!");
                break;
              case 'spreadShot':
                newSpaceship.weaponType = 'spread';
                toast.success("Spread Shot activated!");
                break;
              case 'laser':
                newSpaceship.weaponType = 'laser';
                toast.success("Laser activated!");
                break;
            }
          }
        }
      }

      // Spaceship-asteroid collisions
      if (!isInvulnerable && spaceshipVisible && !prev.gameOver) {
        for (const asteroid of newAsteroids) {
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          const adjustedSize = asteroid.type === 'boss' ? asteroidSize * 1.5 : asteroidSize;
          const distance = Math.sqrt(
            (prev.spaceship.position.x - asteroid.position.x) ** 2 +
            (prev.spaceship.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < (adjustedSize / 2 + GAME_CONSTANTS.SPACESHIP_SIZE / 2)) {
            handleSpaceshipHit();
            break;
          }
        }
      }

      return {
        ...prev,
        bullets: newBullets,
        asteroids: newAsteroids,
        powerUps: newPowerUps,
        score: newScore,
        lives: newLives,
        spaceship: newSpaceship,
        weaponUpgradeTimer: newSpaceship.weaponType !== 'normal' ? GAME_CONSTANTS.WEAPON_UPGRADE_DURATION : 0,
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
    updatePowerUps,
    checkCollisions,
    gameLoopRef,
  };
};
