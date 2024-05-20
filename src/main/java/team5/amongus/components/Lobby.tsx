import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import Task from './interfaces/Interactible'
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../styles/lobby.module.css';

interface Props {
  inGamePlayers: Record<string, Player>;
  firstPlayerName: string;
  onStartButtonClick: () => void;
}

const Lobby: React.FC<Props> = ({ inGamePlayers, firstPlayerName, onStartButtonClick }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(inGamePlayers).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);

  useEffect(() => {
    setPlayerCount(Object.keys(inGamePlayers).length);
  }, [inGamePlayers]);

  const isFirstPlayer = firstPlayerName === Object.keys(inGamePlayers)[0];

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.lobbyBackground}></div>
      <Space />

      <div className={styles.playerCountContainer}>
        <img src="src/main/resources/playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
        <div className={styles.playerCount}>{playerCount}</div>
        {isFirstPlayer && (
          <div className={styles.startButtonContainer} onClick={onStartButtonClick}> {/* Call onStartButtonClick on click */}
            <img src="src\main\resources\startButtonIcon.png" alt="Start Button Icon" className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`}
            />
          </div>
        )}
      </div>

      {Object.values(inGamePlayers).map(player => {
        const isMoving = player.isMoving !== undefined ? player.isMoving : false;

        return (
          <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
            <PlayerSprite
              player={player}
              facing={player.facing !== undefined ? player.facing : 'RIGHT'}
              isMoving={isMoving}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Lobby;
