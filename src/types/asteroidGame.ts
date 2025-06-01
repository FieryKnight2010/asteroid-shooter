
export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Spaceship {
  position: Position;
  rotation: number;
  velocity: Velocity;
  isThrusting: boolean;
  weaponType: 'normal' | 'rapid' | 'spread' | 'laser';
  shieldActive: boolean;
  shieldDuration: number;
}

export interface Bullet {
  id: number;
  position: Position;
  velocity: Velocity;
  lifespan: number;
  type: 'normal' | 'rapid' | 'spread' | 'laser';
  damage: number;
}

export interface Asteroid {
  id: number;
  position: Position;
  velocity: Velocity;
  size: 'large' | 'medium' | 'small';
  rotation: number;
  rotationSpeed: number;
  type: 'normal' | 'fast' | 'armored' | 'explosive' | 'boss';
  health: number;
  maxHealth: number;
}

export interface PowerUp {
  id: number;
  position: Position;
  velocity: Velocity;
  type: 'rapidFire' | 'shield' | 'extraLife' | 'spreadShot' | 'laser';
  lifespan: number;
}

export interface GameState {
  spaceship: Spaceship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  powerUps: PowerUp[];
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  weaponUpgradeTimer: number;
}

export interface Controls {
  left: boolean;
  right: boolean;
  thrust: boolean;
  shoot: boolean;
  reverse?: boolean;
}
