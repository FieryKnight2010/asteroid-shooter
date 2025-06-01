
import React, { useEffect, useState } from 'react';
import { GAME_CONSTANTS } from '../constants/asteroidGameConstants';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

const Starfield: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Generate random stars
    const newStars: Star[] = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
        y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
        size: Math.random() * 2 + 1,
        brightness: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
      });
    }
    setStars(newStars);

    // Animation loop for twinkling
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed) * 0.3 + 0.7;
        const opacity = star.brightness * twinkle;
        
        return (
          <div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity,
              boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${opacity})`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Starfield;
