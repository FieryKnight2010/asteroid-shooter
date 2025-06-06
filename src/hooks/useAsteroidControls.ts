
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
    console.log('Key pressed:', event.code);
    switch (event.code) {
      case 'KeyA':
        event.preventDefault();
        setControls(prev => ({ ...prev, left: true }));
        break;
      case 'KeyD':
        event.preventDefault();
        setControls(prev => ({ ...prev, right: true }));
        break;
      case 'KeyW':
        event.preventDefault();
        setControls(prev => ({ ...prev, thrust: true }));
        break;
      case 'KeyS':
        event.preventDefault();
        setControls(prev => ({ ...prev, reverse: true }));
        break;
      case 'Space':
        event.preventDefault();
        console.log('Space key pressed - calling shoot function');
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
      case 'KeyA':
        setControls(prev => ({ ...prev, left: false }));
        break;
      case 'KeyD':
        setControls(prev => ({ ...prev, right: false }));
        break;
      case 'KeyW':
        setControls(prev => ({ ...prev, thrust: false }));
        break;
      case 'KeyS':
        setControls(prev => ({ ...prev, reverse: false }));
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
