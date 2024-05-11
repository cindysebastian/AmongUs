import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import Interactible from './interfaces/Interactible'
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../../amongus/lobby.module.css';

interface Props {
  players: Record<string, Player>;
  interactibles: Interactible[];
  firstPlayerName: string;
  onStartButtonClick: () => void;
}

const Lobby: React.FC<Props> = ({ players, interactibles, firstPlayerName, onStartButtonClick }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(players).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);

  useEffect(() => {
    setPlayerCount(Object.keys(players).length);
  }, [players]);

  // Check if the current player is the first one
  const isFirstPlayer = firstPlayerName === Object.keys(players)[0];
  console.log(interactibles);

  return (
    <div style={{ position: 'relative' }}>
      {/* Render Background */}
      <div className={styles.lobbyBackground}></div>
      <Space />

      <div className={styles.playerCountContainer}>
        <img src="src\main\resources\playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
        <div className={styles.playerCount}>{playerCount}</div>
        {/* Render the start button only for the first player */}
        {isFirstPlayer && (
          <div className={styles.startButtonContainer} onClick={onStartButtonClick}> {/* Call onStartButtonClick on click */}
            <img src="src\main\resources\startButtonIcon.png" alt="Start Button Icon" className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`}
            />
          </div>
        )}
      </div>

      {/* Render interactibles */}
      <div>
        

        {interactibles.map(interactible => (
          <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y, left: interactible.position.x }}>
            <div className={styles.interactible} style={{ width: interactible.width, height: interactible.height, backgroundColor: 'pink' }}></div>
          </div>
        ))}
      </div>

      {/* Render players */}
      {Object.values(players).map(player => {
        // Ensure that isMoving property is present and initialized before accessing it
        const isMoving = player.isMoving !== undefined ? player.isMoving : false;

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