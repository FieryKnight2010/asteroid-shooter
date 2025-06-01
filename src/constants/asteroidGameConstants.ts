

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Spaceship
  SPACESHIP_SIZE: 20,
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
    large: 40,
    medium: 25,
    small: 15
  },
  
  // Asteroid types
  ASTEROID_TYPES: {
    normal: { health: 1, speedMultiplier: 1, points: 1 },
    fast: { health: 1, speedMultiplier: 2, points: 2 },
    armored: { health: 3, speedMultiplier: 0.7, points: 3 },
    explosive: { health: 1, speedMultiplier: 1.1, points: 2 }
  },
  
  // Game progression
  INITIAL_LIVES: 3,
  LIVES_PER_LEVEL: 3,
  MAX_LEVELS: 30,
  POINTS: {
    large: 20,
    medium: 50,
    small: 100
  },
  
  // Level progression - removed old system
  BASE_ASTEROIDS: 3,
  ASTEROIDS_PER_LEVEL: 1,
  MAX_ASTEROIDS: 15,
  SPEED_INCREASE_PER_LEVEL: 0.15,
  
  // Level-based asteroid type introduction
  ASTEROID_TYPE_LEVELS: {
    normal: 1,    // Available from level 1
    fast: 8,      // Introduced at level 8
    armored: 15,  // Introduced at level 15
    explosive: 22 // Introduced at level 22
  },
  
  // Physics
  WRAP_MARGIN: 50,
  
  // Explosion
  EXPLOSION_RADIUS: 100,
} as const;

