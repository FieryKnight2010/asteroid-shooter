
import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  jump: () => void;
  resetGame: () => void;
  gameOver: boolean;
}

export const useKeyboardControls = ({ jump, resetGame, gameOver }: UseKeyboardControlsProps) => {
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
  }, [jump, resetGame, gameOver]);
};
