
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
  type: 'normal' | 'fast' | 'armored' | 'explosive' | 'rapidFire' | 'shield' | 'extraLife' | 'homing';
  health: number;
  maxHealth: number;
}

export interface GravityWell {
  id: number;
  position: Position;
  strength: number;
  radius: number;
  lifespan: number;
  maxLifespan: number;
}

export interface DroppedItem {
  id: number;
  position: Position;
  type: 'laser';
  lifespan: number;
  maxLifespan: number;
}

export interface PowerupState {
  rapidFire: number; // frames remaining
  shield: number; // frames remaining
  laser: number; // frames remaining
}

export interface LaserBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number; // frames to show the beam
}

export interface GameState {
  spaceship: Spaceship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  gravityWells: GravityWell[];
  droppedItems: DroppedItem[];
  laserBeam: LaserBeam | null;
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  gameStarted: boolean;
  paused: boolean;
  powerups: PowerupState;
}

export interface Controls {
  left: boolean;
  right: boolean;
  thrust: boolean;
  shoot: boolean;
  reverse?: boolean;
}
