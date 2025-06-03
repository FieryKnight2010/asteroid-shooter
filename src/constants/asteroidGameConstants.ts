
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
    large: { min: 0.1, max: 0.3 },
    medium: { min: 0.15, max: 0.4 },
    small: { min: 0.2, max: 0.6 }
  },
  ASTEROID_SIZES: {
    large: 40,
    medium: 25,
    small: 15
  },
  
  // Asteroid types
  ASTEROID_TYPES: {
    normal: { health: 1, speedMultiplier: 1, points: 1 },
    fast: { health: 1, speedMultiplier: 1.3, points: 2 },
    armored: { health: 3, speedMultiplier: 0.7, points: 3 },
    explosive: { health: 1, speedMultiplier: 1.1, points: 2 },
    rapidFire: { health: 1, speedMultiplier: 0.8, points: 5 },
    shield: { health: 1, speedMultiplier: 0.8, points: 5 },
    extraLife: { health: 1, speedMultiplier: 0.8, points: 5 }
  },
  
  // Powerup durations (in frames)
  POWERUP_DURATIONS: {
    rapidFire: 600, // 10 seconds at 60fps
    shield: 480, // 8 seconds at 60fps
  },
  
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
