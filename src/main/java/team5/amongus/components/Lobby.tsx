import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../../amongus/lobby.module.css';

interface Props {
  players: Record<string, Player>;
}

const Lobby: React.FC<Props> = ({ players }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(players).length);

  useEffect(() => {
    setPlayerCount(Object.keys(players).length);
  }, [players]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Render Background */}
      <div className={styles.lobbyBackground}></div>
      <Space />

      <div className={styles.playerCountContainer}>
        <img src="src\main\resources\playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
        <div className={styles.playerCount}>{playerCount}</div>
      </div>

      {/* Render players */}
      {Object.values(players).map(player => {
        // Ensure that isMoving property is present and initialized before accessing it
        const isMoving = player.isMoving !== undefined ? player.isMoving : false;
        console.log(`Player ${player.name} isMoving:`, isMoving);
        return (
          <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
            {/* Pass the correct isMoving value to PlayerSprite */}
            <PlayerSprite
              player={player}
              facing={player.facing !== undefined ? player.facing : 'RIGHT'}
              isMoving={isMoving} // Pass isMoving prop
            />
          </div>
        );
      })}
    </div>
  );
};

export default Lobby;
