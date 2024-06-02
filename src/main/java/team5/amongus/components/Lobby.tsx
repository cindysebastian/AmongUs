import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import Task from './interfaces/Interactible'
import { useLocation } from 'react-router-dom';
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../styles/lobby.module.css';

interface Props {
  inGamePlayers: Record<string, Player>;
  onStartButtonClick: (playersData: Record<string, Player>) => void;
  roomCode: string;
  currentPlayer: string;
}

const Lobby: React.FC<Props> = ({ inGamePlayers, onStartButtonClick, roomCode , currentPlayer}) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(inGamePlayers).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [impostersChosen, setImpostersChosen] = useState(false);
  const [isHost, setIsHost] = useState(false);



  useEffect(() => {
    setPlayerCount(Object.keys(inGamePlayers).length);
  }, [inGamePlayers]);

  useEffect(() => {
    if (inGamePlayers[currentPlayer] && inGamePlayers[currentPlayer].host) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }, [inGamePlayers, currentPlayer]);


  function copyToClipboard(text: string, element: HTMLElement) {
    navigator.clipboard.writeText(text).then(() => {
      console.log(`Copied to clipboard: ${text}`);
      showTooltip(element);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  function showTooltip(element: HTMLElement) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = 'Copied!';
    element.appendChild(tooltip);
    setTimeout(() => {
      tooltip.classList.add('show-tooltip');
      setTimeout(() => {
        tooltip.classList.remove('show-tooltip');
        setTimeout(() => {
          element.removeChild(tooltip);
        }, 300);
      }, 2000);
    }, 10);
  }

  const handleStartButtonClick = () => {
    if (!impostersChosen) {
      setIsStartButtonClicked(true);
      setImpostersChosen(true);
      onStartButtonClick(inGamePlayers); // Pass players' data to the onStartButtonClick function
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.lobbyBackground}></div>
      <Space />
      <div className={styles.roomCode}>
        Room Code: {roomCode}
      </div>
      <div className={styles.playerCountContainer}>
        <img src="src/main/resources/playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
        <div className={styles.playerCount}>{playerCount}</div>

        <div className={styles.gameCode} onClick={(e) => copyToClipboard(roomCode, e.currentTarget)}>CODE: {roomCode}</div>
        {isHost && (
          <div className={styles.startButtonContainer} onClick={handleStartButtonClick}>
            <img src="src/main/resources/startButtonIcon.png" alt="Start Button Icon" className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`}
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