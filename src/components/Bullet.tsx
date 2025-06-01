
import React from 'react';
import { Bullet as BulletType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface BulletProps {
  bullet: BulletType;
}

const Bullet: React.FC<BulletProps> = ({ bullet }) => {
  const { position } = bullet;
  const size = GAME_CONSTANTS.BULLET_SIZE;

  return (
    <div
      className="absolute pointer-events-none bg-yellow-400 rounded-full"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size * 2,
        height: size * 2,
        boxShadow: '0 0 8px #ffff00',
      }}
    />
  );
};

export default Bullet;
