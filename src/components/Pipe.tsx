
import React from 'react';

interface PipeProps {
  x: number;
  height: number;
  gap: number;
  groundHeight: number;
}

const Pipe: React.FC<PipeProps> = ({ x, height, gap, groundHeight }) => {
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
        {/* Pipe cap */}
        <div className="absolute bottom-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-b-2 border-green-800"></div>
      </div>
      
      {/* Bottom pipe */}
      <div 
        className="bg-gradient-to-r from-green-600 to-green-500 border-2 border-green-700 shadow-lg"
        style={{
          width: '80px',
          height: `${600 - height - gap - groundHeight * 4}px`, // Use groundHeight * 4 for proper spacing
          top: `${height + gap}px`,
        }}
      >
        {/* Pipe cap */}
        <div className="absolute top-0 w-full h-6 bg-gradient-to-r from-green-700 to-green-600 border-t-2 border-green-800"></div>
      </div>
    </div>
  );
};

export default Pipe;
