import React from 'react';
import bgImage from '../../../../resources/LoginBG.png';

const Map = () => {
  return (
    <div
      className="map-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        zIndex: -1, // Set a negative z-index to keep it behind other elements
      }}
    ></div>
  );
};

export default Map;
