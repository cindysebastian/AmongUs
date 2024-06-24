import React from 'react';
import Player from './interfaces/Player';
import styled, { css, keyframes } from 'styled-components';
import SpritePage from '../../../../../resources/playerSpriteSheet.png';

type PlayerProps = {
  player: Player;
  facing: 'LEFT' | 'RIGHT';
  ismoving: boolean;
  isAlive: boolean;
};

type StyledPlayerProps = {
  $facing: 'LEFT' | 'RIGHT';
  $ismoving?: boolean; // Make $ismoving optional
};

const mainAnimation = keyframes`
  0% { background-position: calc(1040px - 15px) 0; } 
  100% { background-position: calc(2075px - 15px) 0; }
`;

const ghostAnimation = keyframes`
  0% { background-position: 100% 1200pc; } 
  100% { background-position: 0% 1200pc; }
`;

const StyledPlayer = styled.div<StyledPlayerProps>`
  height: 130px;
  width: 130px;
  position: relative;
  background: url(${SpritePage}) left top;
  box-sizing: border-box;
  transform: ${({ $facing }) => ($facing === 'LEFT' ? 'scaleX(-0.6)' : 'scaleX(0.6)')} scaleY(0.6);
  ${({ $ismoving }) =>
    $ismoving &&
    css`
      animation: ${mainAnimation} 0.6s steps(8) infinite;
      animation-timing-function: steps(8);
    `}
`;

const GhostPlayer = styled(StyledPlayer)`
  background: url(${SpritePage}) left bottom;
  animation: ${ghostAnimation} 1.3s steps(15) infinite alternate;
`;

const NameTagWrapper = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
`;

const NameTag = styled.div`
  padding: 5px 10px;
  color: white;
  font-size: 20px;
  text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000;
  white-space: nowrap;
  font-family: 'Lucida Console';
`;

const FlippedNameTag = styled(NameTag)`
  transform: scaleX(-1);
`;

const PlayerSprite: React.FC<PlayerProps> = ({ player, facing, ismoving, isAlive }) => {
  return (
    <>
      {isAlive && player.isAlive && (
        <StyledPlayer $facing={facing} $ismoving={ismoving || undefined}>
          <NameTagWrapper>
            {facing === 'LEFT' ? (
              <FlippedNameTag>{player.name}</FlippedNameTag>
            ) : (
              <NameTag>{player.name}</NameTag>
            )}
          </NameTagWrapper>
        </StyledPlayer>
      )}
      {!isAlive && (
        !player.isAlive ? (
          <GhostPlayer $facing={facing} $ismoving={ismoving || undefined}>
            <NameTagWrapper>
              {facing === 'LEFT' ? (
                <FlippedNameTag>{player.name}</FlippedNameTag>
              ) : (
                <NameTag>{player.name}</NameTag>
              )}
            </NameTagWrapper>
          </GhostPlayer>
        ) : (
          <StyledPlayer $facing={facing} $ismoving={ismoving || undefined}>
            <NameTagWrapper>
              {facing === 'LEFT' ? (
                <FlippedNameTag>{player.name}</FlippedNameTag>
              ) : (
                <NameTag>{player.name}</NameTag>
              )}
            </NameTagWrapper>
          </StyledPlayer>
        )
      )}
    </>
  );
};

export default PlayerSprite;
