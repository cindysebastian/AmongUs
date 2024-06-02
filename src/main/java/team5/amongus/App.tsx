import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import SpaceShip from './components/SpaceShip';
import styles from './styles/index.module.css';
import { subscribeToGameStatus } from './service (Frontend)/GameStartingService';
import { connectWebSocket, subscribeToPlayers, subscribeToMessages, sendInteraction, sendChatMessage, subscribetoInteractions, subscribetoGameFinishing } from './service (Frontend)/WebsocketService';
import { movePlayer } from './service (Frontend)/PlayerMovementService';
import KillButton from './components/KillButton';
import GameEndHandler from './components/GameEnd/GameEndHandler';

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
  const [inputCode, setInputCode] = useState('');
  const [players, setPlayers] = useState({});
  const [messages, setMessages] = useState([]);
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
  const [gameState, setGameState] = useState('');
  const [inGamePlayers, setInGamePlayers] = useState({});
  const [roomCode, setRoomCode] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(3); // Add state for selected player count

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

      //All Game context Subscriptions here please, ensures RoomCode is valid and present!
      subscribeToPlayers(stompClient, playerName, setPlayers, setInGamePlayers, roomCode);
      subscribeToMessages(stompClient, setMessages, roomCode);
      subscribeToGameStatus(stompClient, setRedirectToSpaceShip, roomCode);
      subscribetoInteractions(stompClient, setInteractibles, roomCode);
      subscribetoGameFinishing(stompClient, setGameState, roomCode);
    }
  }, [roomCode, playerName]);

  const sendMessage = (messageContent) => {
    if (!interactionInProgress && stompClient) {
      sendChatMessage(stompClient, playerName, messageContent, roomCode);
    }
  };

  useEffect(() => {
    if (interactibles && playerName) {
      const playerInteracting = interactibles.some(interactible =>
        interactible.inProgress && interactible.assignedPlayer === playerName
      );
      setInteractionInProgress(playerInteracting);
    }
  }, [interactibles, playerName]);




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

  const handle2InputChange = (event) => {
    setInputCode(event.target.value);
  };

  const handlePlayerCountChange = (event) => {
    setSelectedPlayerCount(parseInt(event.target.value, 10));
  };

  const handleHostGame = () => {
    const trimmedName = inputName.trim();
    console.log("Hosting Game...");

    if (trimmedName && stompClient) {
      const subscription = stompClient.subscribe('/topic/hostResponse', (message) => {
        const response = JSON.parse(message.body);
        console.log("Response:" + response.roomCode)
        if (response.status === 'OK') {
          setPlayerName(trimmedName);
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
      stompClient.send('/app/hostGame', {}, JSON.stringify({ playerName: trimmedName, playerCount: selectedPlayerCount }));
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
    if (gameState == "Imposter wins"|| gameState == "Crewmates win") {
      navigate('/end');
    }
  }, [gameState, navigate]);

  useEffect(() => {
    if (redirectToSpaceShip && gameState== "Game running") {
      navigate('/spaceship');
      //TODO: Add Info about Roles animation here before navigating
    }
  }, [redirectToSpaceShip, gameState, navigate]);

  const handleJoinGame = (playerName, roomCode) => {
    roomCode = inputCode;

    const trimmedName = inputName ? inputName.trim() : '';
    if (!trimmedName || !stompClient || !roomCode) {
      console.error("Missing required parameters for joining game:", { trimmedName, stompClient, roomCode });
      return;
    }

    const message = {
      playerName: trimmedName,
      roomCode: roomCode
    };

    stompClient.send(`/app/joinGame/${roomCode}`, {}, JSON.stringify(message));

    const subscription = stompClient.subscribe('/topic/joinResponse', (message) => {
      const response = JSON.parse(message.body);
      console.log("Response:" + response.roomCode)
      if (response.status === 'OK') {
        setPlayerName(trimmedName);
        let string = response.roomCode;
        setRoomCode(string);
        setPlayerSpawned(true);
        setInputName('');

        navigate('/game');
      } else if (response.status === 'NAME_TAKEN') {
        alert('Failed to join game: This name is already in use! Please choose another. ');
      } else if (response.status === 'NO_SUCH_ROOM') {
        alert('Failed to join game: The Room with the code you entered does not exist. Please double check your code.');
      } else if (response.status === 'FULL') {
        alert('Failed to join game: The Room with the code you entered is already full!');
      } else {
        alert('Failed to Join game. Message: ' + response.message);
      }// Unsubscribe after receiving the response
      subscription.unsubscribe();
    });
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
            <select value={selectedPlayerCount} onChange={handlePlayerCountChange} className={styles.input}>
              {[...Array(8).keys()].map(i => (
                <option key={i + 3} value={i + 3}>{i + 3}</option>
              ))}
            </select>
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
            <input
              type="text"
              value={inputCode}
              onChange={handle2InputChange}
              placeholder="Enter your Room Code"
              className={styles.input}
            />
            <button onClick={() => handleJoinGame(playerName, roomCode)} className={styles.button}>Join Private Room</button>
          </div></div>
      </div>} />
      <Route path="/game" element={<Lobby inGamePlayers={inGamePlayers} onStartButtonClick={handleStartButtonClick} roomCode={roomCode} currentPlayer={playerName} messages={messages} sendMessage={sendMessage}/> } />
      <Route path="/spaceship" element={<SpaceShip stompClient={stompClient} players={players} interactibles={interactibles} currentPlayer={playerName} roomCode={roomCode} />} />
      <Route path="/end" element={<GameEndHandler stompClient={stompClient} players={players} currentPlayer={playerName} setInteractionInProgress={setInteractionInProgress} gameStatus={gameState}/>} />
      <Route path="/" element={<Navigate replace to="/login" />} />
      
      
    </Routes>
  );
};

export default App;
