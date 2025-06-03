
import React from 'react';
import { DroppedItem as DroppedItemType } from '../types/asteroidGame';

interface DroppedItemProps {
  item: DroppedItemType;
}

const DroppedItem: React.FC<DroppedItemProps> = ({ item }) => {
  const { position, type, lifespan, maxLifespan } = item;
  const opacity = lifespan / maxLifespan;
  const size = 30;

  const getItemVisual = () => {
    switch (type) {
      case 'laser':
        return {
          color: '#ff0040',
          glow: 'rgba(255, 0, 64, 0.8)',
          border: '#cc0033'
        };
      default:
        return {
          color: '#ffffff',
          glow: 'rgba(255, 255, 255, 0.8)',
          border: '#cccccc'
        };
    }
  };

  const visual = getItemVisual();

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        opacity,
        filter: `drop-shadow(0 0 6px ${visual.glow})`,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 30 30">
        {type === 'laser' && (
          <>
            {/* Outer glow */}
            <circle
              cx="15"
              cy="15"
              r="12"
              fill="none"
              stroke={visual.glow}
              strokeWidth="2"
              className="animate-pulse"
            />
            
            {/* Main body */}
            <circle
              cx="15"
              cy="15"
              r="10"
              fill={`url(#laserGradient)`}
              stroke={visual.border}
              strokeWidth="1"
            />
            
            {/* Laser beam symbol */}
            <rect
              x="13"
              y="8"
              width="4"
              height="14"
              fill="#ffffff"
              className="animate-pulse"
            />
            <rect
              x="10"
              y="11"
              width="10"
              height="2"
              fill="#ffffff"
              className="animate-pulse"
            />
            <rect
              x="10"
              y="17"
              width="10"
              height="2"
              fill="#ffffff"
              className="animate-pulse"
            />
            
            {/* Energy particles */}
            <circle cx="8" cy="10" r="1" fill="#ffffff" className="animate-pulse" />
            <circle cx="22" cy="12" r="1" fill="#ffffff" className="animate-pulse" />
            <circle cx="6" cy="20" r="1" fill="#ffffff" className="animate-pulse" />
            <circle cx="24" cy="18" r="1" fill="#ffffff" className="animate-pulse" />
          </>
        )}
        
        {/* Gradients */}
        <defs>
          <radialGradient id="laserGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor={visual.color} />
            <stop offset="70%" stopColor={visual.border} />
            <stop offset="100%" stopColor="#330011" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default DroppedItem;
