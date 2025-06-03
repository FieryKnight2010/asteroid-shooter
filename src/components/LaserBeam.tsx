
import React from 'react';
import { LaserBeam as LaserBeamType } from '../types/asteroidGame';

interface LaserBeamProps {
  laserBeam: LaserBeamType;
}

const LaserBeam: React.FC<LaserBeamProps> = ({ laserBeam }) => {
  const { startX, startY, endX, endY, duration } = laserBeam;
  
  // Calculate opacity based on remaining duration
  const opacity = Math.max(0.3, duration / 8);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Outer glow */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="rgba(255, 0, 64, 0.3)"
          strokeWidth="8"
          opacity={opacity}
          className="animate-pulse"
        />
        
        {/* Main beam */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#ff0040"
          strokeWidth="3"
          opacity={opacity}
        />
        
        {/* Inner core */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#ffffff"
          strokeWidth="1"
          opacity={opacity * 1.5}
        />
      </svg>
    </div>
  );
};

export default LaserBeam;
