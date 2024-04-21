
import React from 'react';
import Player from './interfaces/Player'; // Assuming Player is exported as named export
import styled, { css, keyframes } from 'styled-components';
import SpritePage from '../../../../resources/playerSpriteSheet.jpg';

type PlayerProps = {
  player: Player;
  facing: 'LEFT' | 'RIGHT';
  isMoving: boolean;
};

const mainAnimation = keyframes`
  0% { background-position: 1040px 0; } 
  100% { background-position: 2075px 0; }
`;

const StyledPlayer = styled.div<PlayerProps>`
  height: 130px;
  width: 130px;
  position: relative;
  background: url(${SpritePage}) left top;
  transform: ${({ facing }) => facing === 'LEFT' ? 'scaleX(-1)' : 'scaleX(1)'};
  ${({ isMoving }) =>
    isMoving &&
    css`
      animation: ${mainAnimation} 0.6s steps(8) infinite;
      animation-timing-function: steps(8);
    `}
`;

const NameTag = styled.div`
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 10px;
  color: white;
  text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000;
  white-space: nowrap; /* Prevent name from breaking into new lines */
`;

const FlippedNameTag = styled(NameTag)`
  transform: translateX(-50%) scaleX(-1); /* Flips only the text */
`;

const PlayerSprite: React.FC<PlayerProps> = ({ player, facing, isMoving }) => {
  console.log("ismoving in Sprite:", isMoving); // Log the value of ismoving
  return (
    <StyledPlayer player={player} facing={facing} isMoving={isMoving}>
      {facing === 'LEFT' ? (
        <FlippedNameTag>{player.name}</FlippedNameTag>
      ) : (
        <NameTag>{player.name}</NameTag>
      )}
    </StyledPlayer>
  );
};

export default PlayerSprite;

