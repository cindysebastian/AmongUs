// SpaceShip.tsx

import React from 'react';
import Stomp from 'stompjs'; // Import Stomp
import Task from './Task'; // Import the Task component


import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import TaskType from "./interfaces/Interactible";

interface Props {
  stompClient: Stomp.Client | null; // Add stompClient to props
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentPlayer: String;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentPlayer }) => {

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
          <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
            {/* Render each player's sprite */}
            <PlayerSprite
              player={player}
              facing={player.facing !== undefined ? player.facing : 'RIGHT'}
              isMoving={player.isMoving !== undefined ? player.isMoving : false}
            />
          </div>
        ))}



        <div>
          {/* Pass stompClient to Task component */}
          <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer}/>
        </div>
      </div>
    </div>
  );
};

export default SpaceShip;