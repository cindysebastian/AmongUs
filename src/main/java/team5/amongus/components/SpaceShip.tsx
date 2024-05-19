// SpaceShip.tsx

import React from 'react';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import Task from './Task';
import styles from '../../amongus/spaceship.module.css';
import Stomp from 'stompjs';

interface Props {
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentplayer: string;
  stompClient: Stomp.Client | null;
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

        {/* Render interactibles using Task component */}
        <div>
          {interactibles.map(interactible => (
            <Task key={interactible.id} interactible={interactible} currentplayer={currentplayer} stompClient={stompClient} interactibles={interactibles} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceShip;
