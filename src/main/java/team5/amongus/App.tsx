// App.tsx

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import SpaceShip from './components/SpaceShip';
import bgImage from '../../../resources/LoginBG.png';
import styles from './index.module.css';
import { connectWebSocket, subscribeToPlayers, subscribeToMessages, sendInteraction, sendChatMessage, setPlayer } from './service (Frontend)/WebsocketService';
import { movePlayer } from '././service (Frontend)/PlayerMovementService';
import {startGame} from '././service (Frontend)/GameStartingService'
import KillButton from './components/KillButton';

const directionMap = {
  'w': 'UP',
  'a': 'LEFT',
  's': 'DOWN',
  'd': 'RIGHT',
};

const App = ({ history }) => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [firstPlayerName, setFirstPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [playerSpawned, setPlayerSpawned] = useState(false);
  const [selectedVictim, setSelectedVictim] = useState('');
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false); // Add state for tracking start button click
  const [redirectToSpaceShip, setRedirectToSpaceShip] = useState(false); // Add state to control redirection to SpaceShip

  useEffect(() => {
    const unsubscribeWebSocket = connectWebSocket(setStompClient);
    return () => unsubscribeWebSocket();
  }, []);

  useEffect(() => {
    if (stompClient && playerName) {
      return subscribeToPlayers(stompClient, playerName, setPlayers);
    }
  }, [stompClient, playerName]);

  useEffect(() => {
    if (stompClient) {
      return subscribeToMessages(stompClient, setMessages);
    }
  }, [stompClient]);

  useEffect(() => {
    if (stompClient && playerSpawned) {
      return movePlayer(stompClient, playerName, keysPressed);
    }
  }, [stompClient, playerName, playerSpawned]);

  const sendMessage = (messageContent) => {
    if (stompClient) {
      sendChatMessage(stompClient, playerName, messageContent);
    }
  };

  const handleSpawnPlayer = () => {
    if (!firstPlayerName) {
      setFirstPlayerName(playerName.trim());}
    if (stompClient && playerName.trim()) {
      setPlayer(stompClient, playerName);
      setPlayerSpawned(true);
      history.push('/game');
    }
  };

  const handleStartButtonClick = () => {
    setIsStartButtonClicked(true);
    if (stompClient) {
      stompClient.send('/app/startGame', {}, JSON.stringify(Object.values(players)));
    }
  };

  useEffect(() => {
    startGame(stompClient, setRedirectToSpaceShip)
  }, [stompClient]);

  const handleKill = () => {
    if (stompClient && playerName && players) {
      // Find the closest player to the current player
      let closestPlayer = null;
      let minDistance = Infinity;
      for (const [name, player] of Object.entries(players)) {
        if (name !== playerName) { // Exclude the current player
          // Calculate distance between current player and other players
          const distance = calculateDistance(player, players[playerName]);
          if (distance < minDistance) {
            minDistance = distance;
            closestPlayer = name;
          }
        }
      }
      if (closestPlayer) {
        // Send a message to the backend indicating the victim's name
        stompClient.send('/kill', {}, closestPlayer);
      }
    }
  };
  
  // Function to calculate distance between two players
  function calculateDistance(player1, player2) {
    const dx = player1.x - player2.x;
    const dy = player1.y - player2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      {!playerSpawned && (
        <div className={styles.gifBackground}></div>
      )}
      {!playerSpawned && (
        <div className={styles.loginbackground}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className={styles.input}
            />
            <button onClick={handleSpawnPlayer} className={styles.button}>Spawn Player</button>
          </div>
        </div>
      )}
      {playerSpawned && !redirectToSpaceShip && (
        <div style={{ position: 'relative' }}>
          <Lobby players={players} firstPlayerName={firstPlayerName} onStartButtonClick={handleStartButtonClick} /> 

          <button onClick={() => setChatVisible(!chatVisible)} className={styles.cursor}>Chat</button>
          {chatVisible && (
            <div className={styles.chatBox}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ color: 'white', margin: '0' }}>Chat</h2>
              </div>
              <button className={styles.button} onClick={() => setChatVisible(false)}>Exit</button>
              <MessageInput sendMessage={sendMessage} chatVisible={chatVisible} />
              <ChatRoom messages={messages} />
            </div>
          )}
        </div>
      )}
      {redirectToSpaceShip && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
          <SpaceShip players={players} />
        </div>
      )}
      <div>
        <KillButton onKill={handleKill} />
      </div>
    </div>
  );
};

export default App;