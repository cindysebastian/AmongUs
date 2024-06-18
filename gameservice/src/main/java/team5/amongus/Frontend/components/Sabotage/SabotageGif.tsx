import React from 'react';
import Stomp from "stompjs";
import Sabotage from '../interfaces/Sabotage';
import styles from './Sabotage.module.css';

interface Props {
  stompClient: Stomp.Client | null;
  sabotage: Sabotage;
  roomCode: String;
}

const SabotageGif: React.FC<Props> = ({ stompClient, sabotage, roomCode }) => {
  if (sabotage.name === "EndGameSabotage"){
    return (      
      <div className={styles.sabotage}>
        <video className={styles.balrogBackgroundVideo} autoPlay loop>
          <source src="gameservice/src/main/resources/sabotage/EndGameSabotage.mp4" type='video/mp4' />
        </video>
      </div>
    )
  }
  return (
    <div className={styles.sabotage}>
      <img 
        src={`gameservice/src/main/resources/sabotage/${sabotage.name}.gif`} 
        alt={`${sabotage.name} gif`} 
        style={{ height: "100%", width: "100%", position: "fixed", zIndex: 6, pointerEvents: 'none' }} 
      />
      
      <audio controls autoPlay loop>
        <source src="gameservice/src/main/resources/sabotage/CreepyDragonRoar.wav" type="audio/mpeg" />
      </audio>
    </div>
  )
}

export default SabotageGif;
