import React, { useState, useEffect } from 'react';
import SpritePage from '../../../../resources/playerSpriteSheet.jpg';
import styled, { css, keyframes } from 'styled-components';

const mainAnimation = keyframes`
  0% { background-position: 1040px 0; } 
  100% { background-position: 2075px 0; }
`;

const getAnimation = (key) => {
  if (key === 'a' || key === 'd' || key === 'w' || key === 's') {
    return css`
      ${mainAnimation} 0.8s steps(8) infinite;
    `;
  } else {
    return css`
      background-position: 0 0;
    `;
  }
};

export const Player = styled.div`
  height: 130px;
  width: 130px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: url(${SpritePage}) left top;
  animation: ${({ pressedKey }) => getAnimation(pressedKey)};
  transform: ${({ direction }) => direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'};
`;

const PlayerComponent = () => {
  const [pressedKey, setPressedKey] = useState(null);
  const [direction, setDirection] = useState('right');

  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'd' || key === 'w' || key === 's') {
      setPressedKey(key);
      if ((key === 'a' && direction !== 'left')) {
        setDirection('left');
      }else if((key==='d' && direction !== 'right')){
        setDirection('right');
      }
    }
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' || key === 'd' || key === 'w' || key === 's') {
      setPressedKey(null);
      if ((key === 'a' && direction === 'left') || (key === 'd' && direction === 'right')) {
        setDirection(''); // Reset direction when opposite key is released
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <Player pressedKey={pressedKey} direction={direction} />;
};

export default PlayerComponent;
