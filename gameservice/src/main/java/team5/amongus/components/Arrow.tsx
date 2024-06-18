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
    transform: `rotate(${angle-90}deg)`,
    transformOrigin: 'center',
  };

  return (
    <svg
      height="64px"
      width="64px"
      version="1.1"
      viewBox="-440.32 -440.32 1392.64 1392.64"
      fill="#000000"
      style={arrowStyle}
    >
        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#1c2222" stroke-width="73.728"> <style type="text/css"> </style> <g> <polygon className="st0" points="358.402,195.5 358.402,0 153.598,0 153.598,195.5 18.616,195.5 255.991,512 493.384,195.5 "/> </g> </g> 
      <g>
        <polygon
          className="st0"
          fill="#778e8c"
          points="358.402,195.5 358.402,0 153.598,0 153.598,195.5 18.616,195.5 255.991,512 493.384,195.5"
        />
      </g>
    </svg>
  );
};

export default Arrow;
