
export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Spaceship
  SPACESHIP_SIZE: 50,
  SPACESHIP_THRUST: 0.3,
  SPACESHIP_ROTATION_SPEED: 0.15,
  SPACESHIP_MAX_SPEED: 8,
  SPACESHIP_FRICTION: 0.98,
  
  // Bullets
  BULLET_SPEED: 10,
  BULLET_LIFESPAN: 60, // frames
  BULLET_SIZE: 3,
  MAX_BULLETS: 20,
  
  // Asteroids
  ASTEROID_SPEEDS: {
    large: { min: 0.2, max: 0.5 },
    medium: { min: 0.3, max: 0.8 },
    small: { min: 0.5, max: 1.2 }
  },
  ASTEROID_SIZES: {
    large: 60,
    medium: 45,
    small: 30
  },
  
  // Asteroid types
  ASTEROID_TYPES: {
    normal: { health: 1, speedMultiplier: 1, points: 1 },
    fast: { health: 1, speedMultiplier: 1.5, points: 2 },
    armored: { health: 3, speedMultiplier: 0.7, points: 3 },
    explosive: { health: 1, speedMultiplier: 1.1, points: 2 },
    homing: { health: 1, speedMultiplier: 0.6, points: 4 },
    rapidFire: { health: 1, speedMultiplier: 0.8, points: 5 },
    shield: { health: 1, speedMultiplier: 0.8, points: 5 },
    extraLife: { health: 1, speedMultiplier: 0.8, points: 5 },
    laser: { health: 1, speedMultiplier: 0.8, points: 5 }
  },
  
  // Powerup durations (in frames)
  POWERUP_DURATIONS: {
    rapidFire: 600, // 10 seconds at 60fps
    shield: 480, // 8 seconds at 60fps
    laser: 600, // 10 seconds at 60fps
  },
  
  // Dropped items
  DROPPED_ITEM_LIFESPAN: 900, // 15 seconds at 60fps
  LASER_DROP_CHANCE: 0.1, // 10% chance
  
  // Game progression
  INITIAL_LIVES: 3,
  POINTS: {
    large: 20,
    medium: 50,
    small: 100
  },
  
  // Level progression
  BASE_ASTEROIDS: 4,
  ASTEROIDS_PER_LEVEL: 2,
  MAX_ASTEROIDS: 12,
  
  // Physics
  WRAP_MARGIN: 50,
  
  // Explosion
  EXPLOSION_RADIUS: 100,
} as const;
