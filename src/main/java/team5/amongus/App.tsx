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

  return (
    <div style={{ padding: '20px' }}>
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
        <div>
          {/* Pass firstPlayerName as a prop to the Lobby component */}
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
        <SpaceShip players={players} /> // Render the SpaceShip component and pass players data
      )}
    </div>
  );
};

export default App;