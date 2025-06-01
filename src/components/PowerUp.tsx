
import React from 'react';
import { PowerUp as PowerUpType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface PowerUpProps {
  powerUp: PowerUpType;
}

const PowerUp: React.FC<PowerUpProps> = ({ powerUp }) => {
  const { position, type } = powerUp;
  const size = GAME_CONSTANTS.POWERUP_SIZE;

  const getPowerUpStyle = () => {
    switch (type) {
      case 'rapidFire':
        return { color: '#ff4444', icon: 'R', glow: 'rgba(255, 68, 68, 0.6)' };
      case 'shield':
        return { color: '#4444ff', icon: 'S', glow: 'rgba(68, 68, 255, 0.6)' };
      case 'extraLife':
        return { color: '#44ff44', icon: '+', glow: 'rgba(68, 255, 68, 0.6)' };
      case 'spreadShot':
        return { color: '#ffaa00', icon: '◊', glow: 'rgba(255, 170, 0, 0.6)' };
      case 'laser':
        return { color: '#ff00ff', icon: 'L', glow: 'rgba(255, 0, 255, 0.6)' };
    }
  };

  const style = getPowerUpStyle();

  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        backgroundColor: style.color,
        border: `2px solid ${style.color}`,
        borderRadius: '50%',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: `0 0 10px ${style.glow}`,
        animation: 'pulse 2s infinite',
      }}
    >
      {style.icon}
    </div>
  );
};

export default PowerUp;
