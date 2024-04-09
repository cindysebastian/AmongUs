import React from 'react';
import type Player from './interfaces/Player';
import styled, { css, keyframes } from 'styled-components';
import SpritePage from '../../../../resources/playerSpriteSheet.jpg'

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
  ismoving: boolean;
  facing: 'LEFT' | 'RIGHT';
};

const StyledPlayer = styled.div<PlayerProps>`
  height: 130px;
  width: 130px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: url(${SpritePage}) left top;
  ${({ ismoving, facing }) => css`
    ${getAnimation(ismoving)}
    transform: scaleX(${facing === 'LEFT' ? -1 : 1});
  `}
`;

const PlayerSprite: React.FC<PlayerProps> = ({ ismoving, facing }) => {
  return <StyledPlayer ismoving={ismoving} facing={facing} />;
};


export default PlayerSprite;
