import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import SpaceShip from './components/SpaceShip';
import Host from './components/Host';
import Private from './components/Private';
import styles from './styles/index.module.css';
import { connectWebSocket, subscribeToPlayers, subscribeToMessages, sendChatMessage, setPlayer, subscribetoInteractions } from './service (Frontend)/WebsocketService';
import { movePlayer } from './service (Frontend)/PlayerMovementService';
import { startGame } from './service (Frontend)/GameStartingService';
import { handleInteraction } from './service (Frontend)/InteractionService';

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
  const [selectedVictim, setSelectedVictim] = useState('');
  const [interactibles, setInteractibles] = useState([]);
  const [interactionInProgress, setInteractionInProgress] = useState(false);
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [redirectToSpaceShip, setRedirectToSpaceShip] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [inGamePlayers, setInGamePlayers] = useState({});
  const [host, setHost] = useState(false);
  const [privateRoom, setPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [hostingGame, setHostingGame] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      if (stompClient && playerName) {
        stompClient.send('/app/heartbeat', {}, JSON.stringify({ playerName: playerName }));
      }
    }, 1000);
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
    let subscription;

    if (stompClient) {
      subscription = subscribetoInteractions(stompClient, (interactibles) => {
        setInteractibles(interactibles);
      });
    }

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
      sendChatMessage(stompClient, playerName, messageContent);
    }
  };

  useEffect(() => {
    startGame(stompClient, setRedirectToSpaceShip);
  }, [stompClient]);

  useEffect(() => {
    if (stompClient && playerSpawned) {
      return movePlayer(stompClient, playerName, keysPressed, interactionInProgress);
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
      handleInteraction(stompClient, playerName);
    }
  };

  const handleSpawnPlayer = () => {
    const trimmedName = inputName.trim();

    if (trimmedName) {
      setPlayerName(trimmedName);
      if (Object.values(inGamePlayers as Record<string, { name: string }>).some(player => player.name === trimmedName)) {
        alert('Player name already exists in the game. Please choose a different name.');
        return;
      }
      if (!firstPlayerName) {
        setFirstPlayerName(trimmedName);
      }
      if (stompClient) {
        if (Object.keys(players).length > 0) {
          alert('The game has already started. You cannot join at this time.');
          return;
        }
        setPlayer(stompClient, trimmedName);
        setPlayerSpawned(true);
        setInputName('');
        navigate('/game');
      }
    }
  };

  const handleInputChange = (event) => {
    setInputName(event.target.value);
  };

  const handleHost = () => {
    setHost(true);
    navigate('/host');
  };

  const handlePrivate = () => {
    setPrivate(true);
    navigate('/private');
  };

  const handleStartButtonClick = () => {
    setIsStartButtonClicked(true);
    if (stompClient) {
      stompClient.send('/app/startGame');
    }
  };

  useEffect(() => {
    if (redirectToSpaceShip && gameStarted) {
      navigate('/spaceship');
    }
  }, [redirectToSpaceShip, gameStarted, navigate]);

  const handleJoinPrivateRoom = () => {
    // Implementation for joining a private room
  };

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
          {host && !playerSpawned && (
            <div className={styles.loginbackground}>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
                <input
                  type="text"
                  value={inputName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={styles.input}
                />
                <button onClick={handleSpawnPlayer} className={styles.button}>Host Game</button>
              </div>
            </div>
          )}
          {privateRoom && !playerSpawned && (
            <div className={styles.loginbackground}>
              <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
                <input
                  type="text"
                  value={inputName}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={styles.input}
                />
                <button onClick={handleSpawnPlayer} className={styles.button}>Join Private Room</button>
              </div>
            </div>
          )}
        </div>
      } />
      <Route path="/host" element={<Host history={undefined} />} />
      <Route path="/private" element={ <Private history={undefined} />} />
      <Route path="/game" element={<Lobby inGamePlayers={inGamePlayers} firstPlayerName={firstPlayerName} onStartButtonClick={handleStartButtonClick} />} />
      <Route path="/spaceship" element={ <SpaceShip stompClient={stompClient} players={players} interactibles={interactibles} currentPlayer={playerName} />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
    </Routes>
  );
};

export default App;
