
export interface Pipe {
  id: number;
  x: number;
  height: number;
  passed: boolean;
}

export interface GameState {
  gameStarted: boolean;
  gameOver: boolean;
  score: number;
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  showInstructions: boolean;
}
