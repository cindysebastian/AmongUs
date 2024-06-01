import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import SpaceShip from './components/SpaceShip';
import styles from './styles/index.module.css';
import { connectWebSocket, subscribeToPlayers, subscribeToMessages, sendChatMessage, subscribetoInteractions, sendInteraction } from './service (Frontend)/WebsocketService';
import { movePlayer } from './service (Frontend)/PlayerMovementService';
import { subscribeToGameStatus } from './service (Frontend)/GameStartingService';


const directionMap = {
  w: 'UP',
  a: 'LEFT',
  s: 'DOWN',
  d: 'RIGHT',
};

const App = () => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [firstPlayerName, setFirstPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [playerSpawned, setPlayerSpawned] = useState(false);
  const [interactibles, setInteractibles] = useState([]);
  const [interactionInProgress, setInteractionInProgress] = useState(false);
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const [redirectToSpaceShip, setRedirectToSpaceShip] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inGamePlayers, setInGamePlayers] = useState({});
  const [roomCode, setRoomCode] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (stompClient && playerName) {
        stompClient.send('/app/heartbeat', {}, JSON.stringify({ playerName: playerName, roomCode: roomCode }));
      }
    }, 1000);
    return () => clearInterval(heartbeatInterval);
  }, [stompClient, playerName]);

  useEffect(() => {
    const unsubscribeWebSocket = connectWebSocket(setStompClient);
    return () => unsubscribeWebSocket();
  }, []);

  useEffect(() => {
    if (roomCode && playerName) {
      // Perform operations that depend on roomCode here
      console.log("Room Code Updated:", roomCode);

      // Example: Subscribe to players and messages
      subscribeToPlayers(stompClient, playerName, setPlayers, setInGamePlayers, roomCode);
      subscribeToMessages(stompClient, setMessages, roomCode);
      subscribeToGameStatus(stompClient, setRedirectToSpaceShip, roomCode);
    }
  }, [roomCode, playerName]);


  useEffect(() => {
    let subscription;

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [stompClient]);

  useEffect(() => {
    if (interactibles && playerName) {
      const playerInteracting = interactibles.some(interactible =>
        interactible.inProgress && interactible.assignedPlayer === playerName
      );
      setInteractionInProgress(playerInteracting);
    }
  }, [interactibles, playerName]);

  const sendMessage = (messageContent) => {
    if (!interactionInProgress && stompClient) {
      sendChatMessage(stompClient, playerName, messageContent, roomCode);
    }
  };


  useEffect(() => {
    if (stompClient && playerSpawned) {
      return movePlayer(stompClient, playerName, keysPressed, interactionInProgress, roomCode);
    }
  }, [stompClient, playerName, playerSpawned, interactionInProgress]);

  useEffect(() => {
    const handleBlur = () => {
      keysPressed.current = {
        w: false,
        a: false,
        s: false,
        d: false,
      };
    };

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (playerSpawned) {
      window.addEventListener('keydown', handleInteractionKeyPress);
      return () => {
        window.removeEventListener('keydown', handleInteractionKeyPress);
      };
    }
  }, [playerSpawned]);

  const handleInteractionKeyPress = (e) => {
    if (e.key === 'e' && !interactionInProgress) {
      sendInteraction(stompClient, playerName, roomCode);
    }
  };

  const handleInputChange = (event) => {
    setInputName(event.target.value);
  };

  const handleHostGame = () => {
    const trimmedName = inputName.trim();
    console.log("Hosting Game...");
    console.log(trimmedName && stompClient);

    if (trimmedName && stompClient) {
      const subscription = stompClient.subscribe('/topic/hostResponse', (message) => {
        const response = JSON.parse(message.body);
        console.log("Response:" + response.roomCode)
        if (response.status === 'OK') {
          setPlayerName(trimmedName);
          setFirstPlayerName(trimmedName);
          let string = response.roomCode;
          setRoomCode(string);
          setPlayerSpawned(true);
          setInputName('');
          
          navigate('/game');
        } else {
          alert('Failed to host game: ' + response.message);
        }
        // Unsubscribe after receiving the response
        subscription.unsubscribe();
      });

      // After subscribing, send the hostGame message
      stompClient.send('/app/hostGame', {}, JSON.stringify({ playerName: trimmedName }));
    }
  };


  const handlePrivate = () => {
    navigate('/private');
  };

  const handleHost = () => {
    navigate('/host');
  };

  const handleStartButtonClick = () => {
    if (stompClient) {
      stompClient.send('/app/startGame/' + roomCode);
    }
  };

  useEffect(() => {
    if (redirectToSpaceShip && gameStarted) {
      navigate('/spaceship');
    }
  }, [redirectToSpaceShip, gameStarted, navigate]);

  const handleJoinGame = (playerName, roomCode) => {
    const message = {
      playerName: playerName,
      roomCode: roomCode
    };
    stompClient.send('/app/joinGame/' + roomCode, message);
  }

  return (
    <Routes>
      <Route path="/login" element={
        <div style={{ position: 'relative', padding: '20px' }}>
          {!playerSpawned && (
            <div className={styles.gifBackground}></div>
          )}
          {!playerSpawned && (
            <div className={styles.loginbackground}>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '7%', bottom: '0px', left: '50%', right: '50%' }}>
                <button onClick={handleHost} className={styles.button}>HOST</button>
                <button onClick={handlePrivate} className={styles.button}>PRIVATE</button>
              </div>
            </div>
          )}
        </div>
      } />
      <Route path="/host" element={<div className={styles.gifBackground}>
        <div className={styles.loginbackground}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
            <input
              type="text"
              value={inputName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={styles.input}
            />
            <button onClick={handleHostGame} className={styles.button}>Host Game</button>
          </div></div>
      </div>} />
      <Route path="/private" element={<div className={styles.gifBackground}>
        <div className={styles.loginbackground}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
            <input
              type="text"
              value={inputName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={styles.input}
            />
            <button onClick={() => handleJoinGame(playerName, roomCode)} className={styles.button}>Join Private Room</button>
          </div></div>
      </div>} />
      <Route path="/game" element={<Lobby inGamePlayers={inGamePlayers} firstPlayerName={firstPlayerName} onStartButtonClick={handleStartButtonClick} />} />
      <Route path="/spaceship" element={<SpaceShip stompClient={stompClient} players={players} interactibles={interactibles} currentPlayer={playerName} roomCode={roomCode} />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  );
};

export default App;
