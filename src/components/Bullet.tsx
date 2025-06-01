
import React from 'react';
import { Bullet as BulletType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface BulletProps {
  bullet: BulletType;
}

const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  const { position, type } = bullet;
  const size = GAME_CONSTANTS.BULLET_SIZE;

  const getBulletStyle = () => {
    switch (type) {
      case 'normal':
        return { color: '#ffff00', glow: '#ffff00' };
      case 'rapid':
        return { color: '#ff4444', glow: '#ff4444' };
      case 'spread':
        return { color: '#ffaa00', glow: '#ffaa00' };
      case 'laser':
        return { color: '#ff00ff', glow: '#ff00ff', width: size * 4, height: size };
    }
  };

  const style = getBulletStyle();

  if (type === 'laser') {
    return (
      <div
        className="absolute pointer-events-none"
        style={{
          left: position.x - style.width / 2,
          top: position.y - style.height / 2,
          width: style.width,
          height: style.height,
          backgroundColor: style.color,
          boxShadow: `0 0 8px ${style.glow}`,
          borderRadius: '2px',
        }}
      />
    );
  }

  return (
    <div
      className="absolute pointer-events-none bg-yellow-400 rounded-full"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size * 2,
        height: size * 2,
        backgroundColor: style.color,
        boxShadow: `0 0 8px ${style.glow}`,
      }}
    />
  );
};

export default Bullet;
