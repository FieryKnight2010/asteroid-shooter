
import React from 'react';
import { Spaceship as SpaceshipType } from '../types/asteroidGame';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface SpaceshipProps {
  spaceship: SpaceshipType;
  isThrusting: boolean;
}

const Spaceship: React.FC<SpaceshipProps> = ({ spaceship, isThrusting }) => {
  const { position, rotation } = spaceship;
  const size = GAME_CONSTANTS.SPACESHIP_SIZE;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        transform: `rotate(${rotation + Math.PI / 2}rad)`,
        filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.4))',
      }}
    >
      <div className="relative w-full h-full">
        <svg width={size} height={size} viewBox="0 0 24 24">
          {/* Thrust flames */}
          {isThrusting && (
            <>
              <polygon
                points="8,20 12,28 16,20"
                fill="url(#outerFlame)"
                className="animate-pulse"
              />
              <polygon
                points="9,20 12,26 15,20"
                fill="url(#innerFlame)"
                className="animate-pulse"
              />
              <polygon
                points="10,20 12,24 14,20"
                fill="#ffffff"
                className="animate-pulse"
                opacity="0.8"
              />
            </>
          )}
          
          {/* Main ship hull */}
          <polygon
            points="12,2 16,8 15,16 9,16 8,8"
            fill="url(#hullGradient)"
            stroke="#00ccff"
            strokeWidth="0.5"
          />
          
          {/* Ship wings */}
          <polygon
            points="8,8 4,12 6,14 9,12"
            fill="url(#wingGradient)"
            stroke="#0099cc"
            strokeWidth="0.5"
          />
          <polygon
            points="16,8 20,12 18,14 15,12"
            fill="url(#wingGradient)"
            stroke="#0099cc"
            strokeWidth="0.5"
          />
          
          {/* Cockpit */}
          <ellipse
            cx="12"
            cy="7"
            rx="2.5"
            ry="3"
            fill="url(#cockpitGradient)"
            stroke="#00ffff"
            strokeWidth="0.5"
          />
          
          {/* Cockpit window */}
          <ellipse
            cx="12"
            cy="6.5"
            rx="1.5"
            ry="2"
            fill="url(#windowGradient)"
            opacity="0.9"
          />
          
          {/* Engine details */}
          <rect
            x="10.5"
            y="14"
            width="3"
            height="4"
            rx="1"
            fill="url(#engineGradient)"
            stroke="#ff6600"
            strokeWidth="0.3"
          />
          
          {/* Wing engines */}
          <circle cx="6" cy="13" r="1" fill="#ff4400" opacity="0.8" />
          <circle cx="18" cy="13" r="1" fill="#ff4400" opacity="0.8" />
          
          {/* Navigation lights */}
          <circle cx="8" cy="10" r="0.5" fill="#ff0000" className="animate-pulse" />
          <circle cx="16" cy="10" r="0.5" fill="#00ff00" className="animate-pulse" />
          
          {/* Hull details */}
          <line x1="12" y1="4" x2="12" y2="14" stroke="#66ddff" strokeWidth="0.5" opacity="0.7" />
          <line x1="10" y1="12" x2="14" y2="12" stroke="#66ddff" strokeWidth="0.3" opacity="0.5" />
          <line x1="10.5" y1="10" x2="13.5" y2="10" stroke="#66ddff" strokeWidth="0.3" opacity="0.5" />
          
          {/* Gradients and effects */}
          <defs>
            <linearGradient id="hullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#66ddff" />
              <stop offset="30%" stopColor="#0099cc" />
              <stop offset="70%" stopColor="#006699" />
              <stop offset="100%" stopColor="#003d5c" />
            </linearGradient>
            
            <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0099cc" />
              <stop offset="50%" stopColor="#006699" />
              <stop offset="100%" stopColor="#003d5c" />
            </linearGradient>
            
            <linearGradient id="cockpitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#99eeff" />
              <stop offset="50%" stopColor="#33ccff" />
              <stop offset="100%" stopColor="#0099cc" />
            </linearGradient>
            
            <radialGradient id="windowGradient" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#66ddff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0066cc" stopOpacity="0.8" />
            </radialGradient>
            
            <linearGradient id="engineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6600" />
              <stop offset="50%" stopColor="#cc4400" />
              <stop offset="100%" stopColor="#992200" />
            </linearGradient>
            
            <linearGradient id="outerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4400" />
              <stop offset="50%" stopColor="#ff6600" />
              <stop offset="100%" stopColor="#ffaa00" />
            </linearGradient>
            
            <linearGradient id="innerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff6600" />
              <stop offset="50%" stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#ffdd00" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Spaceship;
