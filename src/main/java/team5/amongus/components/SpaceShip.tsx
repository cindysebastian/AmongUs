// SpaceShip.tsx

import React from 'react';
import Stomp from 'stompjs'; // Import Stomp
import Task from './Task'; // Import the Task component


import styles from '../../amongus/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';

interface Props {
  stompClient: Stomp.Client | null; // Add stompClient to props
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentplayer: String;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentplayer }) => {
  return (
    <div className={styles.fillContainer}>
      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
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
          <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentplayer}/>
        </div>
      </div>
    </div>
  );
};

export default SpaceShip;
