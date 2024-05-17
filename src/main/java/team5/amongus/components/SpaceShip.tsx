import React, { useState } from 'react';
import Player from './interfaces/Player'; // Import the Player interface
import PlayerSprite from './PlayerSprite';
import styles from '../../amongus/spaceship.module.css';
import KillButton from './KillButton';
import { killPlayer } from '../service (Frontend)/WebsocketService';

interface Props {
  players: Record<string, Player>;
  playerName: string;
  stompClient
}

const SpaceShip: React.FC<Props> = ({ players, playerName, stompClient }) => {
  const handleKill = () => {
    killPlayer(stompClient, playerName);
  };

  return (
    <div>
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
          <KillButton onKill={handleKill} />
        </div>
      </div>
    </div>
  );
};

export default SpaceShip;