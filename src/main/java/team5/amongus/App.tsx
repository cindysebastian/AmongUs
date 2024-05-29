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
import { movePlayer } from './service (Frontend)/PlayerMovementService';
import { startGame } from './service (Frontend)/GameStartingService';
import { handleInteraction } from './service (Frontend)/InteractionService';
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
  const [rooms, setRooms] = useState([]);

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
      let playerInteracting = interactibles.some(interactible =>
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
      // When window loses focus, reset all keys to false
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
    const code = generateRoomCode();
    if (Object.values(inGamePlayers as Record<string, { name: string }>).some(player => player.name === playerName.trim())) {
      alert('Player name already exists in the game. Please choose a different name.');
      return;
    }
    if (stompClient && playerName.trim()) {
      if (Object.keys(players).length > 0) {
        alert("The game has already started. You cannot join at this time.");
        return;
      }
      if (hostingGame) {
        addRoomCode(code);
        setRoomCode(code);
      } else {
        handleJoinPrivateRoom();
      }
      setPlayer(stompClient, playerName, code, true);
      setPlayerSpawned(true);
      history.push(`/game?roomCode=${code}`);
    }
  };

  const generateRoomCode = () => {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000);
    } while (rooms.includes(code));
    return code;
  };

  const addRoomCode = (code) => {
    setRooms([...rooms, code]);
  };

  const handleHost = () => {
    setHost(true);
    setHostingGame(true);
    if (stompClient && playerName) {
      const roomCode = generateRoomCode();
      setPlayer(stompClient, playerName, roomCode, true);
    }
  };
  
  const handlePrivate = () => {
    setPrivate(true);
    setHostingGame(false);
  }
  
  const handleJoinPrivateRoom = () => {
    if (!roomCode || !playerName.trim()) {
      alert("Please enter your name and room code.");
      return;
    }
    if (privateRoom && !roomCode) {
      alert("Please enter the room code.");
      return;
    }
    setPlayer(stompClient, playerName, roomCode, false);
    setPlayerSpawned(true);
    history.push(`/game?roomCode=${roomCode}`);
  };

  const handleStartButtonClick = () => {
    setIsStartButtonClicked(true);
    if (stompClient) {
      stompClient.send('/app/startGame');
    }
  };

  useEffect(() => {
    if (redirectToSpaceShip && gameStarted) {
      history.push('/spaceship');
    }
  }, [redirectToSpaceShip, gameStarted, history]);

  useEffect(() => {
    startGame(stompClient, setRedirectToSpaceShip);

    const handleGameStart = () => {
      history.push('/spaceship');
    };

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
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
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
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className={styles.input}
            />
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className={styles.input}
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleJoinPrivateRoom} className={styles.button}>Join Room</button>
          </div>
        </div>
      )}
      {playerSpawned && !redirectToSpaceShip && (
        <div>
          <Lobby inGamePlayers={inGamePlayers} isHost={host} onStartButtonClick={handleStartButtonClick} />

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
        <SpaceShip stompClient={stompClient} players={players} interactibles={interactibles} currentPlayer={playerName} />
      )}
    </div>
  );
};

export default App;