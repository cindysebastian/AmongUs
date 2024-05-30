import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../styles/lobby.module.css';

interface Props {
  inGamePlayers: Record<string, Player>;
  firstPlayerName: string;
  currentPlayer: string;
  onStartButtonClick: (playersData: Record<string, Player>) => void;
}

const Lobby: React.FC<Props> = ({ inGamePlayers, firstPlayerName, currentPlayer, onStartButtonClick }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(inGamePlayers).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [impostersChosen, setImpostersChosen] = useState(false);

  useEffect(() => {
    setPlayerCount(Object.keys(inGamePlayers).length);
  }, [inGamePlayers]);

  const isFirstPlayer = firstPlayerName === Object.keys(inGamePlayers)[0];

  const handleStartButtonClick = () => {
    if (!impostersChosen) {
      setIsStartButtonClicked(true);
      setImpostersChosen(true);
      onStartButtonClick(inGamePlayers); // Pass players' data to the onStartButtonClick function
    }
  };

  // Camera logic
  const mapWidth = 1920;
  const mapHeight = 1080;
  const playerWidth = 130; 
  const playerHeight = 130;
  const currentPlayerData = inGamePlayers[currentPlayer];

  // Ensure currentPlayerData is defined before accessing its properties
  const cameraStyle = currentPlayerData ? {
    transform: `translate(-${Math.max(0, Math.min(currentPlayerData.position.x + playerWidth / 2 - window.innerWidth / 2, mapWidth - window.innerWidth))}px, -${Math.max(0, Math.min(currentPlayerData.position.y + playerHeight / 2 - window.innerHeight / 2, mapHeight - window.innerHeight))}px)`
  } : {};

  return (
    <div style={{ position: 'relative' }}>  
      <Space />
      <div style={cameraStyle}>
        <div className={styles.lobbyBackground}></div>
        <div>
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
      </div>

      <div className={styles.playerCountContainer}>
        <div className={styles.playerCount}>
          <img src="src/main/resources/playerCountIcon.png" alt="Player Count Icon" className={styles.playerCountIcon} />
          {playerCount}
        </div>
      </div>
      {isFirstPlayer && (
        <div className={styles.startButtonContainer} onClick={handleStartButtonClick}>
          <img src="src/main/resources/startButtonIcon.png" alt="Start Button Icon" className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`} />
        </div>
      )}
    </div>
  );
};

export default Lobby;
