import React from 'react';
import SpritePage from '../../../../resources/playerSpriteSheet.jpg';
import styled, { css, keyframes } from 'styled-components';

const mainAnimation = keyframes`
  0% { background-position: 1040px 0; } 
  100% { background-position: 2075px 0; }
`;

const getAnimation = (isMoving) => {
  if (isMoving) {
    return css`
      ${mainAnimation} 0.8s steps(8) infinite;
    `;
  } else {
    return css`
      ${mainAnimation} 0.8s steps(8) infinite paused;
    `;
  }
};


type PlayerProps = {
  isMoving: boolean;
  direction: 'left' | 'right'; // Assuming direction can be either 'left' or 'right'
};

const Player = styled.div<PlayerProps>`
  height: 130px;
  width: 130px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: url(${SpritePage}) left top;
  animation: ${({ isMoving }) => getAnimation(isMoving)};
  transform: ${({ direction }) => (direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)')};
`;

const PlayerSprite: React.FC<PlayerProps> = ({ isMoving, direction }) => {
  console.log('Direction:', direction);
  console.log('Is Moving:', isMoving);
  return <Player isMoving={isMoving} direction={direction} />;
 
};

export default PlayerSprite;
