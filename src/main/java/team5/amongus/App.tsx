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
  const [collisionMask, setCollisionMask] = useState(null);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false); 
  const [redirectToSpaceShip, setRedirectToSpaceShip] = useState(false); 
  const [gameStarted, setGameStarted] = useState(false);
  const [inGamePlayers, setInGamePlayers] = useState({});

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
    const trimmedName = inputName.trim(); // Trim the input name
  
    // Ensure playerName is updated only when the trimmedName is not empty
    if (trimmedName) {
      setPlayerName(trimmedName); // Set the playerName state
      if (Object.values(inGamePlayers as Record<string, { name: string }>).some(player => player.name === trimmedName)) {
        alert('Player name already exists in the game. Please choose a different name.');
        return;
      }
      if (!firstPlayerName) {
        setFirstPlayerName(trimmedName);
      }
      if (stompClient) {
        if (Object.keys(players).length > 0) {
          alert("The game has already started. You cannot join at this time.");
          return;
        }
        setPlayer(stompClient, trimmedName);
        setPlayerSpawned(true);
        setInputName('');
        history.push('/game');
      }
    }
  };
  
  

  const handleInputChange = (event) => {
    setInputName(event.target.value); // Update local state with input value
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

  }, [stompClient]);

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
              value={inputName}
              onChange={handleInputChange}
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
          <Lobby inGamePlayers={inGamePlayers} firstPlayerName={firstPlayerName} currentPlayer={playerName} onStartButtonClick={handleStartButtonClick} />

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