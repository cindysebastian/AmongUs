import React from 'react';
import bgImage from '../../../../../resources/spaceBG.jpg';

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
        zIndex: -4,
        backgroundPosition: 'center',
      }}
    ></div>
  );
};

export default Map;
