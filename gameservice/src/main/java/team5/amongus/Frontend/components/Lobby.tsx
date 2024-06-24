import React, { useState, useEffect, useRef } from 'react';
import Player from './interfaces/Player';
import Task from './interfaces/Interactible'
import { useLocation } from 'react-router-dom';
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../styles/lobby.module.css';
import MessageInput from './MessageInput';
import ChatRoom from './ChatRoom';
import backgroundMusic from '../../../../../resources/theRing.mp3';

interface Props {
  inGamePlayers: Record<string, Player>;
  onStartButtonClick: (playersData: Record<string, Player>) => void;
  roomCode: string;
  currentPlayer: string;
  messages: String[];
  sendMessage: (messageContent: string) => void;
}

const Lobby: React.FC<Props> = ({ inGamePlayers, onStartButtonClick, roomCode, currentPlayer, messages, sendMessage }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(inGamePlayers).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [impostersChosen, setImpostersChosen] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const currentPlayerObj = inGamePlayers[currentPlayer.trim()] as Player;

  useEffect(() => {
    setPlayerCount(Object.keys(inGamePlayers).length);
  }, [inGamePlayers]);

  useEffect(() => {
    if (inGamePlayers && Object.keys(inGamePlayers).length > 0 && inGamePlayers[currentPlayer]) {
      if (inGamePlayers[currentPlayer].isHost) {
        setIsHost(true);
      } else {
        setIsHost(false);
      }


    } else {
      console.log('inGamePlayers is empty or currentPlayer does not exist in inGamePlayers');
      setIsHost(false); // Optionally set isHost to false if inGamePlayers is empty
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
  // Camera logic
  const mapWidth = 1920;
  const mapHeight = 1080;
  const playerWidth = 80;
  const playerHeight = 80;
  const currentPlayerData = inGamePlayers[currentPlayer.trim()];

  // Ensure currentPlayerData is defined before accessing its properties
  const cameraStyle = currentPlayerData ? {
    transform: `translate(-${Math.max(0, Math.min(currentPlayerData.position.x + playerWidth / 2 - window.innerWidth / 2, mapWidth - window.innerWidth))}px, -${Math.max(0, Math.min(currentPlayerData.position.y + playerHeight / 2 - window.innerHeight / 2, mapHeight - window.innerHeight))}px)`
  } : {};

  return (
    <div style={{ position: 'relative' }}>
      <Space />
      <audio src={backgroundMusic} autoPlay loop />
      <div style={cameraStyle}>
        <div className={styles.lobbyBackground}></div>



        {Object.values(inGamePlayers).map(player => {
          const isMoving = player.isMoving !== undefined ? player.isMoving : false;
          return (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                ismoving={isMoving}
                isAlive={true}
              />
            </div>
          );
        })}
      </div>
      <div onClick={() => setChatVisible(!chatVisible)} className={styles.cursor}>Chat</div>
      {chatVisible && (
        <div className={styles.chatBox}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ color: 'white', margin: '0' }}>Chat</h2>
          </div>
          <button className={styles.button} onClick={() => setChatVisible(false)}>Exit</button>
          <MessageInput
              sendMessage={sendMessage}
              chatVisible={chatVisible}
              playerName={currentPlayer}
              players={inGamePlayers}
            />
          <ChatRoom messages={messages} />
        </div>
      )}

      <div className={styles.iconContainer}>
        <div className={styles.playerCountContainer}>
          <img src="gameservice/src/main/resources/playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
          <div className={styles.playerCount}>{playerCount}</div>
        </div>
        <div className={styles.gameCode} onClick={(e) => copyToClipboard(roomCode, e.currentTarget)}>CODE: {roomCode}
        </div>
        {isHost && (
          <div className={styles.startButtonContainer} onClick={handleStartButtonClick}>
            <img src="gameservice/src/main/resources/startButtonIcon.png" alt="Start Button Icon" className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`}
            />
          </div>
        )}
      </div>
    </div >
  );
};

export default Lobby;