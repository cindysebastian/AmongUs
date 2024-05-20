// SpaceShip.tsx

import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs'; // Import Stomp
import Task from './Task'; // Import the Task component


import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import TaskType from "./interfaces/Interactible";
import KillButton from './KillButton';
import { killPlayer, subscribeToPlayerKilled, subscribeToImposter } from '../service (Frontend)/WebsocketService';

interface Props {
  stompClient: Stomp.Client | null; // Add stompClient to props
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentPlayer: String;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentPlayer }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);

  // Subscribe to player killed events when the component mounts
  useEffect(() => {
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled);
    const unsubscribeImposter = subscribeToImposter(stompClient, (imposterName: string) => {
      if (imposterName === currentPlayer) {
        setIsImposter(true);
      }
    });

    return () => {
      unsubscribeKilled();
      unsubscribeImposter();
    };
  }, [stompClient, currentPlayer]);

  // Handler for player killed event
  const handlePlayerKilled = (killedPlayer: Player) => {
    // Check if the killed player is the current player
    if (killedPlayer.name === currentPlayer) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    setKilledPlayers(prevKilledPlayers => [...prevKilledPlayers, killedPlayer.name]);
  };

  const handleKill = () => {
    killPlayer(stompClient, currentPlayer);
  };

  // Usage
  const completedTasks = interactibles.filter(interactible => interactible.completed).length;


  const totalTasks = interactibles.length;

  const progressPercentage = (completedTasks / totalTasks) * 100;


  return (
    <div className={styles.fillContainer}>


      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
        {/* Progress bar */}
        <ProgressBar progress={progressPercentage} />
        {/* Render players */}
        {Object.values(players).map(player => (
          !killedPlayers.includes(player.name) && (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              {/* Render each player's sprite */}
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                isMoving={player.isMoving !== undefined ? player.isMoving : false}
              />
            </div>
          )
        ))}
        {/* Render PNG image for killed players */}
        {killedPlayers.map(killedPlayerName => (
          <div key={killedPlayerName} style={{ position: 'absolute', top: players[killedPlayerName].position.y, left: players[killedPlayerName].position.x }}>
            {/* Render the PNG image for the killed player */}
            <img src="src\main\resources\deadbodycrewmate.png" alt="Dead Player" style={{width: '80px', height: '90px', marginTop: "25px" }} />
          </div>
        ))}
        <div>
          <KillButton onKill={handleKill} />
        </div>
        {showKillGif && (
          <div className={styles.killGifContainer}></div>
        )}
        <div>
          {/* Pass stompClient to Task component */}
          <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer}/>
        </div>
      </div>
      
    </div>
  );
};

export default SpaceShip;