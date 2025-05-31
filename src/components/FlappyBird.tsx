
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Bird from './Bird';
import Pipe from './Pipe';
import GameUI from './GameUI';
import { toast } from 'sonner';

interface Pipe {
  id: number;
  x: number;
  height: number;
  passed: boolean;
}

const FlappyBird = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [birdY, setBirdY] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const gameLoopRef = useRef<number>();
  const pipeIdRef = useRef(0);
  
  const BIRD_SIZE = 40;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 150; // Reduced from 180 to make it more challenging
  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -8; // Reduced from -12 to make jumps less powerful
  const PIPE_SPEED = 3;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const GROUND_HEIGHT = 20;
  const MIN_GROUND_GAP = 50; // Minimum gap between bottom pipe and ground

  const jump = useCallback(() => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
      setShowInstructions(false);
      toast("Game started! Tap to flap!");
    }
    
    if (gameStarted && !gameOver) {
      setBirdVelocity(JUMP_STRENGTH);
    }
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setBirdY(300);
    setBirdVelocity(0);
    setPipes([]);
    setShowInstructions(true);
    pipeIdRef.current = 0;
  };

  // Generate new pipe
  const generatePipe = useCallback(() => {
    const minHeight = 100;
    const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight - GROUND_HEIGHT - MIN_GROUND_GAP;
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    
    return {
      id: pipeIdRef.current++,
      x: GAME_WIDTH,
      height,
      passed: false
    };
  }, []);

  // Collision detection
  const checkCollision = useCallback((birdY: number, pipes: Pipe[]) => {
    // Ground and ceiling collision
    if (birdY < 0 || birdY + BIRD_SIZE > GAME_HEIGHT) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      const birdLeft = GAME_WIDTH / 2 - BIRD_SIZE / 2;
      const birdRight = GAME_WIDTH / 2 + BIRD_SIZE / 2;
      const birdTop = birdY;
      const birdBottom = birdY + BIRD_SIZE;

      if (
        birdRight > pipe.x &&
        birdLeft < pipe.x + PIPE_WIDTH &&
        (birdTop < pipe.height || birdBottom > pipe.height + PIPE_GAP)
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = () => {
      setBirdY(prevY => {
        const newY = prevY + birdVelocity;
        return newY;
      });

      setBirdVelocity(prevVelocity => prevVelocity + GRAVITY);

      setPipes(prevPipes => {
        let newPipes = prevPipes.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        })).filter(pipe => pipe.x + PIPE_WIDTH > 0);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 300) {
          newPipes.push(generatePipe());
        }

        // Check for score
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x + PIPE_WIDTH < GAME_WIDTH / 2) {
            pipe.passed = true;
            setScore(prevScore => {
              const newScore = prevScore + 1;
              if (newScore % 5 === 0) {
                toast(`Great job! Score: ${newScore}`, {
                  duration: 1000,
                });
              }
              return newScore;
            });
          }
        });

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, birdVelocity, generatePipe]);

  // Collision checking
  useEffect(() => {
    if (gameStarted && !gameOver) {
      if (checkCollision(birdY, pipes)) {
        setGameOver(true);
        toast.error("Game Over! Tap to play again");
      }
    }
  }, [birdY, pipes, gameStarted, gameOver, checkCollision]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump, gameOver]);

  const handleClick = () => {
    if (gameOver) {
      resetGame();
    } else {
      jump();
    }
  };

  return (
    <div className="relative">
      <div 
        className="relative bg-gradient-to-b from-sky-400 to-sky-300 border-4 border-sky-600 rounded-lg shadow-2xl cursor-pointer overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleClick}
      >
        {/* Background clouds */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-16 h-10 bg-white rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-20 h-12 bg-white rounded-full opacity-60 animate-pulse delay-300"></div>
          <div className="absolute top-60 left-32 w-12 h-8 bg-white rounded-full opacity-50 animate-pulse delay-700"></div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-green-600 to-green-400"></div>
        
        {/* Pipes */}
        {pipes.map(pipe => (
          <Pipe key={pipe.id} x={pipe.x} height={pipe.height} gap={PIPE_GAP} groundHeight={GROUND_HEIGHT} />
        ))}
        
        {/* Bird */}
        <Bird 
          y={birdY} 
          velocity={birdVelocity}
          gameStarted={gameStarted}
          gameOver={gameOver}
        />
        
        {/* Game UI */}
        <GameUI 
          score={score}
          gameStarted={gameStarted}
          gameOver={gameOver}
          showInstructions={showInstructions}
          onRestart={resetGame}
        />
      </div>
    </div>
  );
};

export default FlappyBird;
