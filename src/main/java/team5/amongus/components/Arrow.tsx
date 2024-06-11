import React, { CSSProperties } from 'react';

interface ArrowProps {
  x: number;
  y: number;
  angle: number;
}

const Arrow: React.FC<ArrowProps> = ({ x, y, angle }) => {
  const arrowStyle: CSSProperties = {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    transform: `rotate(${angle+90}deg)`,
    transformOrigin: 'center',
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      style={arrowStyle}
    >
      <path d="M10 0 L0 10 L5 10 L5 20 L15 20 L15 10 L20 10 Z" fill="red" />
    </svg>
  );
};

export default Arrow;
