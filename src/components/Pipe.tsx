
import React from 'react';

interface PipeProps {
  x: number;
  height: number;
  gap: number;
  groundHeight: number;
  gameHeight: number;
}

const Pipe: React.FC<PipeProps> = ({ x, height, gap, groundHeight, gameHeight }) => {
  return (
    <div className="absolute" style={{ left: `${x}px` }}>
      {/* Top pipe - extends from top to gap start */}
      <div 
        className="bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700 shadow-lg"
        style={{
          width: '80px',
          height: `${height}px`,
          top: 0,
        }}
      >
        {/* Pipe cap at bottom */}
        <div className="absolute bottom-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-b-2 border-green-800"></div>
      </div>
      
      {/* Bottom pipe - extends from gap end to ground */}
      <div 
        className="bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700 shadow-lg"
        style={{
          width: '80px',
          height: `${gameHeight - height - gap - groundHeight}px`,
          top: `${height + gap}px`,
        }}
      >
        {/* Pipe cap at top */}
        <div className="absolute top-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-t-2 border-green-800"></div>
      </div>
    </div>
  );
};

export default Pipe;
