
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
  
  // Weapon types
  WEAPON_TYPES: {
    normal: { damage: 1, speed: 10, fireRate: 15 },
    rapid: { damage: 1, speed: 12, fireRate: 5 },
    spread: { damage: 1, speed: 8, fireRate: 20 },
    laser: { damage: 3, speed: 15, fireRate: 30 }
  },
  
  // Asteroids
  ASTEROID_SPEEDS: {
    large: { min: 0.5, max: 1.5 },
    medium: { min: 1, max: 2.5 },
    small: { min: 1.5, max: 3 }
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
    explosive: { health: 1, speedMultiplier: 1.2, points: 2 },
    boss: { health: 10, speedMultiplier: 0.5, points: 10 }
  },
  
  // Power-ups
  POWERUP_SPEED: 1,
  POWERUP_SIZE: 15,
  POWERUP_LIFESPAN: 600, // 10 seconds at 60fps
  POWERUP_SPAWN_CHANCE: 0.15, // 15% chance per destroyed asteroid
  
  // Shield
  SHIELD_DURATION: 300, // 5 seconds at 60fps
  
  // Weapon upgrade duration
  WEAPON_UPGRADE_DURATION: 600, // 10 seconds at 60fps
  
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
} as const;
