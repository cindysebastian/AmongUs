import SpritePage from '../../../../resources/playerSpriteSheet.jpg'
import styled, { keyframes } from 'styled-components'



const animation = keyframes`
0% { background-position: 1040px 0; } 
100% { background-position: 2075px 0; }
`;
 export const Player = styled.div`
  height: 130px;
  width: 130px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: url(${SpritePage}) left top;
  animation: ${animation} .8s steps(8) infinite; 
  
`;

export default Player;