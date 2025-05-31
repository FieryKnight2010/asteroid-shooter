
import React from 'react';

interface PipeProps {
  x: number;
  height: number;
  gap: number;
  groundHeight: number;
  gameHeight: number;
  gapSize?: number; // Accept custom gap size
}

const Pipe: React.FC<PipeProps> = ({ x, height, gap, groundHeight, gameHeight, gapSize }) => {
  // Use custom gap size if provided, otherwise fall back to default
  const actualGapSize = gapSize || gap;
  const bottomPipeTop = height + actualGapSize;
  const bottomPipeHeight = gameHeight - bottomPipeTop;
  
  return (
    <div className="absolute" style={{ left: `${x}px` }}>
      {/* Top pipe */}
      <div 
        className="bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700 shadow-lg"
        style={{
          width: '80px',
          height: `${height}px`,
          top: 0,
        }}
      >
        <div className="absolute bottom-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-b-2 border-green-800"></div>
      </div>
      
      {/* Bottom pipe */}
      {bottomPipeHeight > 0 && (
        <div 
          className="bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700 shadow-lg"
          style={{
            width: '80px',
            height: `${bottomPipeHeight}px`,
            top: `${bottomPipeTop}px`,
          }}
        >
          <div className="absolute top-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-t-2 border-green-800"></div>
        </div>
      )}
    </div>
  );
};

export default Pipe;
