// App.tsx

import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import SpaceShip from './components/SpaceShip';
import bgImage from '../../../resources/LoginBG.png';
import styles from './styles/index.module.css';
import { connectWebSocket, subscribeToPlayers, subscribeToMessages, sendInteraction, sendChatMessage, setPlayer, subscribetoInteractions } from './service (Frontend)/WebsocketService';
import { movePlayer } from '././service (Frontend)/PlayerMovementService';
import { startGame } from '././service (Frontend)/GameStartingService'
import { handleInteraction } from './service (Frontend)/InteractionService';

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
  const [interactibles, setInteractibles] = useState([]);
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false); // Add state for tracking start button click
  const [redirectToSpaceShip, setRedirectToSpaceShip] = useState(false); // Add state to control redirection to SpaceShip
  const [gameStarted, setGameStarted] = useState(false);
  const [inGamePlayers, setInGamePlayers] = useState({});

  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
        if (stompClient && playerName) {
            stompClient.send('/app/heartbeat', {}, JSON.stringify({ playerName: playerName }));
        }
    }, 1000); // Send heartbeat every second (adjust as needed)
    return () => clearInterval(heartbeatInterval);
}, [stompClient, playerName]);

  useEffect(() => {
    const unsubscribeWebSocket = connectWebSocket(setStompClient);
    return () => unsubscribeWebSocket();
  }, []);

  useEffect(() => {
    if (stompClient && playerName) {
      return subscribeToPlayers(stompClient, playerName, setPlayers, setInGamePlayers);
    }
  }, [stompClient, playerName]);

  useEffect(() => {
    if (stompClient) {
      return subscribeToMessages(stompClient, setMessages);
    }
  }, [stompClient]);

  useEffect(() => {
    if (stompClient) {
      return subscribetoInteractions(stompClient, setInteractibles);
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

  
  
  useEffect(() => {
    if (playerSpawned) {
      window.addEventListener('keydown', handleInteractionKeyPress);
      return () => {
        window.removeEventListener('keydown', handleInteractionKeyPress);
      };
    }
  }, [playerSpawned]);

  const handleInteractionKeyPress = (e) => {
    if (e.key === 'e') {
      
      handleInteraction(stompClient, playerName.trim()); 
    }
  };

  const handleSpawnPlayer = () => {
    if (Object.values(players as Record<string, { name: string }>).some(player => player.name === playerName.trim())) {
      alert('Player name already exists in the game. Please choose a different name.');
      return;
    }
    if (!firstPlayerName) {
      setFirstPlayerName(playerName.trim());
    }
    if (stompClient && playerName.trim()) {
      setPlayer(stompClient, playerName);
      setPlayerSpawned(true);
      history.push('/game');
    }
  };
  

  const handleStartButtonClick = () => {
    setIsStartButtonClicked(true); // Set the start button clicked state to true
    if (stompClient) {
      stompClient.send('/app/startGame'); // Send message to start the game
    }
  };

  useEffect(() => {
    if (redirectToSpaceShip && gameStarted) { // Only redirect if the game has started
        history.push('/spaceship');
    }
  }, [redirectToSpaceShip, gameStarted, history]);

  useEffect(() => {
    startGame(stompClient, setRedirectToSpaceShip)
    
    const handleGameStart = () => {
      // When the game starts, redirect all players to the spaceship
      history.push('/spaceship');
    };
  
    // Subscribe to the game start topic
    if (stompClient) {
      const subscription = stompClient.subscribe('/topic/gameStart', () => {
        handleGameStart();
      });
  
      return () => {
        subscription.unsubscribe();
      };
    }
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
          <Lobby inGamePlayers={inGamePlayers} firstPlayerName={firstPlayerName} onStartButtonClick={handleStartButtonClick} />

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
          <SpaceShip stompClient={stompClient} players={players} interactibles = {interactibles} currentPlayer ={playerName}/>
      )}
    </div>
  );
};

export default App;
