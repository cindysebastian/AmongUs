import React from 'react';
import Stomp from "stompjs";
import Sabotage from '../interfaces/Sabotage';

interface Props {
  stompClient: Stomp.Client | null;
  sabotage: Sabotage;
  roomCode: String;
}

const SabotageGif: React.FC<Props> = ({ stompClient, sabotage, roomCode }) => {
  return (
    <div style={{ height: "100%", width: "100%", position: "fixed", zIndex: 6, pointerEvents: 'none' , opacity: '50%'}}>
      <img 
        src={`src/main/resources/${sabotage.name}.gif`} 
        alt={`${sabotage.name} gif`} 
        style={{ height: "100%", width: "100%", position: "fixed", zIndex: 6, pointerEvents: 'none' }} 
      />
    </div>
  )
}

export default SabotageGif;
