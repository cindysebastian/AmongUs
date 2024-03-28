// Player.js
import React from 'react';

const Player = ({ position }) => {
  return (
    <div
      style={{
        width: '50px',
        height: '50px',
        backgroundColor: 'blue',
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    ></div>
  );
};

export default Player;
