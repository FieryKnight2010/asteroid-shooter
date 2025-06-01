
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
}

export interface Bullet {
  id: number;
  position: Position;
  velocity: Velocity;
  lifespan: number;
}

export interface Asteroid {
  id: number;
  position: Position;
  velocity: Velocity;
  size: 'large' | 'medium' | 'small';
  rotation: number;
  rotationSpeed: number;
  type: 'normal' | 'fast' | 'armored' | 'explosive';
  health: number;
  maxHealth: number;
}

export interface GameState {
  spaceship: Spaceship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
}

export interface Controls {
  left: boolean;
  right: boolean;
  thrust: boolean;
  shoot: boolean;
  reverse?: boolean;
}
