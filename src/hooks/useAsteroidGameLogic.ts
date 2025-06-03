import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { GameState, Spaceship, Bullet, Asteroid, Position, PowerupState, GravityWell, Velocity, DroppedItem } from '../types/asteroidGame';
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

const createInitialPowerups = (): PowerupState => ({
  rapidFire: 0,
  shield: 0,
  laser: 0,
});

const createInitialGameState = (): GameState => ({
  spaceship: createInitialSpaceship(),
  bullets: [],
  asteroids: [],
  gravityWells: [],
  droppedItems: [],
  laserBeam: null,
  score: 0,
  level: 1,
  lives: GAME_CONSTANTS.INITIAL_LIVES,
  gameOver: false,
  gameStarted: false,
  paused: false,
  powerups: createInitialPowerups(),
});

export const useAsteroidGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [spaceshipVisible, setSpaceshipVisible] = useState(true);
  const gameLoopRef = useRef<number>();
  const bulletIdRef = useRef(0);
  const asteroidIdRef = useRef(0);
  const droppedItemIdRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const fireRateTimerRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const respawnTimerRef = useRef<NodeJS.Timeout>();
  const invulnerabilityTimerRef = useRef<NodeJS.Timeout>();
  const gravityWellIdRef = useRef(0);
  const gravityWellSpawnTimerRef = useRef(0);

  const wrapPosition = (position: Position): Position => ({
    x: ((position.x % GAME_CONSTANTS.CANVAS_WIDTH) + GAME_CONSTANTS.CANVAS_WIDTH) % GAME_CONSTANTS.CANVAS_WIDTH,
    y: ((position.y % GAME_CONSTANTS.CANVAS_HEIGHT) + GAME_CONSTANTS.CANVAS_HEIGHT) % GAME_CONSTANTS.CANVAS_HEIGHT,
  });

  const applyGravityWells = useCallback((position: Position, velocity: Velocity): Velocity => {
    let newVelocity = { ...velocity };
    
    gameState.gravityWells.forEach(well => {
      const dx = well.position.x - position.x;
      const dy = well.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Add minimum distance to prevent infinite force at center
      const minDistance = 15; // Minimum distance to prevent getting stuck
      const effectiveDistance = Math.max(distance, minDistance);
      
      if (distance < well.radius && distance > 0) {
        // Much gentler gravity force with better falloff
        const force = well.strength / (effectiveDistance * effectiveDistance) * 100;
        const forceX = (dx / effectiveDistance) * force;
        const forceY = (dy / effectiveDistance) * force;
        
        newVelocity.x += forceX;
        newVelocity.y += forceY;
        
        // Add tangential force to create more curved trajectories
        // This force is perpendicular to the radial direction
        const tangentialForce = force * 0.4; // Adjust this multiplier to control curve intensity
        const tangentialX = -dy / effectiveDistance * tangentialForce;
        const tangentialY = dx / effectiveDistance * tangentialForce;
        
        // Apply tangential force based on current velocity direction
        // This creates a swirling effect
        const velocityMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        if (velocityMagnitude > 0.1) {
          // Determine rotation direction based on cross product
          const crossProduct = velocity.x * dy - velocity.y * dx;
          const rotationSign = crossProduct > 0 ? 1 : -1;
          
          newVelocity.x += tangentialX * rotationSign;
          newVelocity.y += tangentialY * rotationSign;
        }
      }
    });
    
    // Cap velocity to prevent objects from moving too fast after gravity well effects
    const maxVelocity = 5; // Further reduced for smoother gameplay
    const currentSpeed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
    if (currentSpeed > maxVelocity) {
      newVelocity.x = (newVelocity.x / currentSpeed) * maxVelocity;
      newVelocity.y = (newVelocity.y / currentSpeed) * maxVelocity;
    }
    
    return newVelocity;
  }, [gameState.gravityWells]);

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

  const activatePowerup = useCallback((type: 'rapidFire' | 'shield' | 'extraLife' | 'laser') => {
    setGameState(prev => {
      let newState = { ...prev };
      
      switch (type) {
        case 'rapidFire':
          newState.powerups = { ...prev.powerups, rapidFire: GAME_CONSTANTS.POWERUP_DURATIONS.rapidFire };
          toast.success('Rapid Fire activated!');
          break;
        case 'shield':
          newState.powerups = { ...prev.powerups, shield: GAME_CONSTANTS.POWERUP_DURATIONS.shield };
          toast.success('Shield activated!');
          break;
        case 'extraLife':
          newState.lives = prev.lives + 1;
          toast.success('Extra Life gained!');
          break;
        case 'laser':
          newState.powerups = { ...prev.powerups, laser: GAME_CONSTANTS.POWERUP_DURATIONS.laser };
          toast.success('Laser activated!');
          break;
      }
      
      return newState;
    });
  }, []);

  const createDroppedItem = (position: Position, type: 'laser'): DroppedItem => {
    return {
      id: droppedItemIdRef.current++,
      position,
      type,
      lifespan: GAME_CONSTANTS.DROPPED_ITEM_LIFESPAN,
      maxLifespan: GAME_CONSTANTS.DROPPED_ITEM_LIFESPAN,
    };
  };

  const createAsteroid = (position: Position, size: 'large' | 'medium' | 'small', type?: Asteroid['type']): Asteroid => {
    const currentTime = Date.now();
    // Ensure gameStartTimeRef is properly initialized and prevent negative or extremely large values
    const startTime = gameStartTimeRef.current || currentTime;
    const timeElapsed = Math.max(0, (currentTime - startTime) / 1000);
    // Cap the speed multiplier to prevent insanely fast asteroids
    const speedMultiplier = 1 + Math.min(timeElapsed * 0.02, 2); // Reduced from 0.05 and capped at 3x max
    
    let asteroidType = type;
    if (!asteroidType) {
      const random = Math.random();
      if (random < 0.15) { // Increased from 5% to 15% chance for powerups
        const powerupTypes: Asteroid['type'][] = ['rapidFire', 'shield', 'extraLife', 'laser'];
        asteroidType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
      } else {
        asteroidType = (['normal', 'fast', 'armored', 'explosive', 'homing'][Math.floor(Math.random() * 5)] as Asteroid['type']);
      }
    }
    
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
      const spawnRate = Math.max(minSpawnRate, baseSpawnRate - timeElapsed * 1); // Reduced from 2 to 1

      spawnTimerRef.current++;
      
      if (spawnTimerRef.current >= spawnRate) {
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

  const createGravityWell = (): GravityWell => {
    const position = {
      x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
      y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
    };
    
    return {
      id: gravityWellIdRef.current++,
      position,
      strength: 0.3 + Math.random() * 0.4, // Random strength between 0.3 and 0.7
      radius: 60 + Math.random() * 40, // Random radius between 60 and 100
      lifespan: 600 + Math.random() * 300, // 10-15 seconds at 60fps
      maxLifespan: 600 + Math.random() * 300,
    };
  };

  const startGame = useCallback(() => {
    const newGameState = createInitialGameState();
    newGameState.gameStarted = true;
    newGameState.asteroids = [createRandomAsteroid()];
    // Ensure gameStartTimeRef is properly set
    gameStartTimeRef.current = Date.now();
    spawnTimerRef.current = 0;
    gravityWellSpawnTimerRef.current = 0;
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
        fireRateTimer: fireRateTimerRef.current,
        rapidFireActive: prev.powerups.rapidFire > 0,
        laserActive: prev.powerups.laser > 0
      });

      if (prev.gameOver || !prev.gameStarted) {
        console.log('Cannot shoot - game conditions not met');
        return prev;
      }

      // Handle laser beam shooting
      if (prev.powerups.laser > 0) {
        const fireRateCooldown = 4; // Laser has its own cooldown
        
        if (fireRateTimerRef.current > 0) {
          console.log('Laser fire rate limited, timer:', fireRateTimerRef.current);
          return prev;
        }
        
        fireRateTimerRef.current = fireRateCooldown;
        console.log('Creating laser beam');

        const { spaceship } = prev;
        const startX = spaceship.position.x;
        const startY = spaceship.position.y;
        
        // Calculate end point of laser beam
        const endX = startX + Math.cos(spaceship.rotation) * GAME_CONSTANTS.LASER_BEAM_RANGE;
        const endY = startY + Math.sin(spaceship.rotation) * GAME_CONSTANTS.LASER_BEAM_RANGE;
        
        // Check for asteroids in the laser path and destroy them
        const destroyedAsteroids: number[] = [];
        let newScore = prev.score;
        
        prev.asteroids.forEach((asteroid, index) => {
          // Check if asteroid intersects with laser line
          const distanceToLine = pointToLineDistance(
            asteroid.position.x,
            asteroid.position.y,
            startX,
            startY,
            endX,
            endY
          );
          
          const asteroidRadius = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size] / 2;
          
          if (distanceToLine <= asteroidRadius) {
            destroyedAsteroids.push(index);
            const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroid.type];
            const sizePoints = GAME_CONSTANTS.POINTS[asteroid.size];
            newScore += sizePoints * typeData.points;
          }
        });
        
        // Remove destroyed asteroids
        const newAsteroids = prev.asteroids.filter((_, index) => !destroyedAsteroids.includes(index));
        
        return {
          ...prev,
          laserBeam: {
            startX,
            startY,
            endX,
            endY,
            duration: GAME_CONSTANTS.LASER_BEAM_DURATION,
          },
          asteroids: newAsteroids,
          score: newScore,
        };
      }

      // Regular bullet shooting
      if (prev.bullets.length >= GAME_CONSTANTS.MAX_BULLETS) {
        console.log('Cannot shoot - max bullets reached');
        return prev;
      }

      // Rapid fire reduces cooldown
      const fireRateCooldown = prev.powerups.rapidFire > 0 ? 2 : 8;
      
      if (fireRateTimerRef.current > 0) {
        console.log('Fire rate limited, timer:', fireRateTimerRef.current);
        return prev;
      }
      
      fireRateTimerRef.current = fireRateCooldown;
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

// Helper function to calculate distance from point to line
const pointToLineDistance = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) return Math.sqrt(A * A + B * B);
  
  let param = dot / lenSq;
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const updateSpaceship = useCallback((controls: any) => {
  setGameState(prev => {
    // Decrement fire rate timer
    if (fireRateTimerRef.current > 0) {
      fireRateTimerRef.current--;
    }

    // Update laser beam duration
    let newLaserBeam = prev.laserBeam;
    if (newLaserBeam && newLaserBeam.duration > 0) {
      newLaserBeam = {
        ...newLaserBeam,
        duration: newLaserBeam.duration - 1,
      };
      if (newLaserBeam.duration <= 0) {
        newLaserBeam = null;
      }
    }

    // Update powerup timers
    const newPowerups = {
      rapidFire: Math.max(0, prev.powerups.rapidFire - 1),
      shield: Math.max(0, prev.powerups.shield - 1),
      laser: Math.max(0, prev.powerups.laser - 1),
    };

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

    // Apply gravity wells to spaceship
    newVelocity = applyGravityWells(spaceship.position, newVelocity);

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
      powerups: newPowerups,
      laserBeam: newLaserBeam,
    };
  });
}, [applyGravityWells]);

const updateBullets = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      bullets: prev.bullets
        .map(bullet => {
          const gravityAffectedVelocity = applyGravityWells(bullet.position, bullet.velocity);
          return {
            ...bullet,
            position: wrapPosition({
              x: bullet.position.x + gravityAffectedVelocity.x,
              y: bullet.position.y + gravityAffectedVelocity.y,
            }),
            velocity: gravityAffectedVelocity,
            lifespan: bullet.lifespan - 1,
          };
        })
        .filter(bullet => bullet.lifespan > 0),
    }));
  }, [applyGravityWells]);

  const updateAsteroids = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      asteroids: prev.asteroids.map(asteroid => {
        let newVelocity = { ...asteroid.velocity };
        
        // Apply homing behavior for homing asteroids
        if (asteroid.type === 'homing' && prev.spaceship) {
          const dx = prev.spaceship.position.x - asteroid.position.x;
          const dy = prev.spaceship.position.y - asteroid.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            // Gentle homing force - much weaker than gravity wells
            const homingStrength = 0.02; // Very gentle homing
            const homingForceX = (dx / distance) * homingStrength;
            const homingForceY = (dy / distance) * homingStrength;
            
            newVelocity.x += homingForceX;
            newVelocity.y += homingForceY;
            
            // Cap velocity to maintain slower movement
            const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
            const maxHomingSpeed = 2; // Slower than normal asteroids
            if (speed > maxHomingSpeed) {
              newVelocity.x = (newVelocity.x / speed) * maxHomingSpeed;
              newVelocity.y = (newVelocity.y / speed) * maxHomingSpeed;
            }
          }
        }
        
        const gravityAffectedVelocity = applyGravityWells(asteroid.position, newVelocity);
        return {
          ...asteroid,
          position: wrapPosition({
            x: asteroid.position.x + gravityAffectedVelocity.x,
            y: asteroid.position.y + gravityAffectedVelocity.y,
          }),
          velocity: gravityAffectedVelocity,
          rotation: asteroid.rotation + asteroid.rotationSpeed,
        };
      }),
    }));
    
    spawnAsteroid();
  }, [spawnAsteroid, applyGravityWells]);

  const updateDroppedItems = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      droppedItems: prev.droppedItems
        .map(item => ({
          ...item,
          lifespan: item.lifespan - 1,
        }))
        .filter(item => item.lifespan > 0),
    }));
  }, []);

  const updateGravityWells = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver || prev.paused) {
        return prev;
      }

      // Spawn new gravity wells occasionally
      gravityWellSpawnTimerRef.current++;
      let newGravityWells = [...prev.gravityWells];
      
      // Spawn a new gravity well every 15-20 seconds (900-1200 frames at 60fps)
      const spawnRate = 900 + Math.random() * 300;
      if (gravityWellSpawnTimerRef.current >= spawnRate && newGravityWells.length < 3) {
        gravityWellSpawnTimerRef.current = 0;
        const newWell = createGravityWell();
        newWell.maxLifespan = newWell.lifespan; // Set maxLifespan for opacity calculation
        newGravityWells.push(newWell);
      }

      // Update existing gravity wells
      newGravityWells = newGravityWells
        .map(well => ({
          ...well,
          lifespan: well.lifespan - 1,
        }))
        .filter(well => well.lifespan > 0);

      return {
        ...prev,
        gravityWells: newGravityWells,
      };
    });
  }, []);

  const checkCollisions = useCallback((createExplosion?: (x: number, y: number, color?: string, count?: number) => void) => {
    setGameState(prev => {
      let newBullets = [...prev.bullets];
      let newAsteroids = [...prev.asteroids];
      let newDroppedItems = [...prev.droppedItems];
      let newScore = prev.score;
      let spaceshipHit = false;

    // Remove the old laser collision detection since it's now handled in shoot()

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
            
            const newHealth = asteroid.health - 1;
            
            if (newHealth <= 0) {
              const destroyedAsteroid = newAsteroids.splice(j, 1)[0];
              
              const typeData = GAME_CONSTANTS.ASTEROID_TYPES[asteroid.type];
              const sizePoints = GAME_CONSTANTS.POINTS[asteroid.size];
              newScore += sizePoints * typeData.points;
              
              // Handle powerup asteroids
              if (['rapidFire', 'shield', 'extraLife', 'laser'].includes(asteroid.type)) {
                activatePowerup(asteroid.type as 'rapidFire' | 'shield' | 'extraLife' | 'laser');
                if (createExplosion) {
                  createExplosion(asteroid.position.x, asteroid.position.y, '#ffffff', 10);
                }
              } else {
                // 10% chance to drop laser powerup from regular asteroids
                if (Math.random() < GAME_CONSTANTS.LASER_DROP_CHANCE) {
                  const droppedLaser = createDroppedItem(asteroid.position, 'laser');
                  newDroppedItems.push(droppedLaser);
                }
              }
              
              // Special effects for explosive asteroids
              if (asteroid.type === 'explosive') {
                if (createExplosion) {
                  createExplosion(asteroid.position.x, asteroid.position.y, '#ff4400', 15);
                }
                
                const spaceshipDistance = Math.sqrt(
                  (prev.spaceship.position.x - asteroid.position.x) ** 2 +
                  (prev.spaceship.position.y - asteroid.position.y) ** 2
                );
                
                if (spaceshipDistance < 100 && !isInvulnerable && !prev.powerups.shield && spaceshipVisible && !prev.gameOver) {
                  spaceshipHit = true;
                }
                
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
              newAsteroids[j] = { ...asteroid, health: newHealth };
            }
            
            break;
          }
        }
      }

      // Spaceship-dropped item collisions
      for (let i = newDroppedItems.length - 1; i >= 0; i--) {
        const item = newDroppedItems[i];
        const distance = Math.sqrt(
          (prev.spaceship.position.x - item.position.x) ** 2 +
          (prev.spaceship.position.y - item.position.y) ** 2
        );
        
        if (distance < 25) { // Pickup range
          newDroppedItems.splice(i, 1);
          activatePowerup(item.type);
          if (createExplosion) {
            createExplosion(item.position.x, item.position.y, '#ff0040', 8);
          }
        }
      }

      // Spaceship-asteroid collisions (direct contact)
      if (!isInvulnerable && spaceshipVisible && !prev.gameOver) {
        for (let j = newAsteroids.length - 1; j >= 0; j--) {
          const asteroid = newAsteroids[j];
          const asteroidSize = GAME_CONSTANTS.ASTEROID_SIZES[asteroid.size];
          const distance = Math.sqrt(
            (prev.spaceship.position.x - asteroid.position.x) ** 2 +
            (prev.spaceship.position.y - asteroid.position.y) ** 2
          );
          
          if (distance < (asteroidSize / 2 + GAME_CONSTANTS.SPACESHIP_SIZE / 2)) {
            if (['rapidFire', 'shield', 'extraLife', 'laser'].includes(asteroid.type)) {
              newAsteroids.splice(j, 1);
              activatePowerup(asteroid.type as 'rapidFire' | 'shield' | 'extraLife' | 'laser');
              if (createExplosion) {
                createExplosion(asteroid.position.x, asteroid.position.y, '#ffffff', 10);
              }
            } else if (!prev.powerups.shield) {
              spaceshipHit = true;
            }
            break;
          }
        }
      }

      if (spaceshipHit && !prev.powerups.shield) {
        handleSpaceshipHit();
      }

      return {
        ...prev,
        bullets: newBullets,
        asteroids: newAsteroids,
        droppedItems: newDroppedItems,
        score: newScore,
      };
    });
  }, [isInvulnerable, spaceshipVisible, handleSpaceshipHit, activatePowerup, createDroppedItem]);

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
    updateGravityWells,
    updateDroppedItems,
    checkCollisions,
    gameLoopRef,
  };
};
