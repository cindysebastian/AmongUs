import React from 'react';
import Player from './interfaces/Player'; // Assuming Player is exported as named export
import styled, { css, keyframes } from 'styled-components';
import SpritePage from '../../../../resources/playerSpriteSheet.jpg';

type PlayerProps = {
  player: Player;
  facing: 'LEFT' | 'RIGHT';
  isMoving: boolean;
};

type StyledPlayerProps = {
  facing: 'LEFT' | 'RIGHT'; // Define facing property for StyledPlayer component
  isMoving: boolean;
};

const mainAnimation = keyframes`
  0% { background-position: 1040px 0; } 
  100% { background-position: 2075px 0; }
`;

const StyledPlayer = styled.div<StyledPlayerProps>`
  height: 130px;
  width: 130px;
  position: relative; /* Ensure position is set */
  background: url(${SpritePage}) left top;
  transform: ${({ facing }) => facing === 'LEFT'? 'scaleX(-1) translateX(1px)' : 'none'};
  ${({ isMoving, facing }) =>
    isMoving &&
    css`
      animation: ${mainAnimation} 0.6s steps(8) infinite;
      animation-timing-function: steps(8);
      margin-left: ${facing === 'LEFT'? '-20px' : '0'};
      transform: ${facing === 'LEFT'? 'scaleX(-1) translateX(-74px)' : 'scaleX(1) translateX(-74px)'};
    `}
`;

const NameTagWrapper = styled.div`
  position: absolute;
  top: -20px; /* Adjust the top position as needed */
  left: 50%;
  transform: translateX(-50%);
`;

const NameTag = styled.div`
  padding: 5px 10px;
  color: white;
  font-size: 20px;
  text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000;
  white-space: nowrap; /* Prevent name from breaking into new lines */
`;

const FlippedNameTag = styled(NameTag)`
  transform: scaleX(-1); /* Flips only the text */
`;

const PlayerSprite: React.FC<PlayerProps> = ({ player, facing, isMoving }) => {
  console.log("ismoving in Sprite:", isMoving); // Log the value of ismoving
  return (
    <StyledPlayer facing={facing} isMoving={isMoving}>
      <NameTagWrapper>
        {facing === 'LEFT' ? (
          <FlippedNameTag>{player.name}</FlippedNameTag>
        ) : (
          <NameTag>{player.name}</NameTag>
        )}
      </NameTagWrapper>
    </StyledPlayer>
  );
};

export default PlayerSprite;
