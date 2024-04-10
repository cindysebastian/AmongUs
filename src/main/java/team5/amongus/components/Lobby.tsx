import React, { useEffect, useState } from 'react';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import bgImage from '../../../../resources/LobbyBG.png';
import Space from './Space';
import styles from '../../amongus/lobby.module.css'

interface Props {
  players: Record<string, Player>;
}


interface PlayerComponentProps {
  player: Player;
}


const Lobby: React.FC<Props> = ({ players }) => {
  return (
    <div style={{ position: 'relative' }}>
      {/* Render Background */}
      <div className={styles.lobbyBackground}
      ></div>
      <Space />

      {/* Render players */}
      {Object.values(players).map(player => (
        <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
          <PlayerSprite
            key={player.name}
            facing={player.facing !== undefined ? player.facing : 'RIGHT'}
            ismoving={player.ismoving !== undefined ? player.ismoving : false}
          />
        </div>
      ))}

    </div>
  );
};


export default Lobby;