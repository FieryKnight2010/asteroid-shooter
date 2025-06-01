
import { useState, useEffect, useCallback } from 'react';
import { Controls } from '../types/asteroidGame';

interface UseAsteroidControlsProps {
  shoot: () => void;
  pauseGame: () => void;
}

export const useAsteroidControls = ({ shoot, pauseGame }: UseAsteroidControlsProps) => {
  const [controls, setControls] = useState<Controls>({
    left: false,
    right: false,
    thrust: false,
    shoot: false,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
        event.preventDefault();
        setControls(prev => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setControls(prev => ({ ...prev, right: true }));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setControls(prev => ({ ...prev, thrust: true }));
        break;
      case 'Space':
        event.preventDefault();
        shoot();
        break;
      case 'KeyP':
        event.preventDefault();
        pauseGame();
        break;
    }
  }, [shoot, pauseGame]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowLeft':
        setControls(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
        setControls(prev => ({ ...prev, right: false }));
        break;
      case 'ArrowUp':
        setControls(prev => ({ ...prev, thrust: false }));
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return controls;
};
