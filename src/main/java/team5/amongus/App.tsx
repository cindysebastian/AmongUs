import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import Map from './components/Space';
import bgImage from '../../../resources/LoginBG.png';
import styles from './index.module.css'

const directionMap = {
  'w': 'UP',
  'a': 'LEFT',
  's': 'DOWN',
  'd': 'RIGHT'
};

const App = ({ history }) => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const[messages, setMessages] = useState([]);
  const[chatVisible, setChatVisible] = useState(false);
  const [playerSpawned, setPlayerSpawned] = useState(false);
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false
  });

  //#region websocket subscribes
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stomp = Stomp.over(socket);

    stomp.connect({}, () => {
      console.log('Connected to WebSocket');
      setStompClient(stomp);
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
        console.log('Disconnected from WebSocket');
      }
    };
  }, []);

  useEffect(() => {
    if (!stompClient) return;

    stompClient.subscribe('/topic/players', (message) => {
      const updatedPlayers = JSON.parse(message.body);
      setPlayers(updatedPlayers);
    });
  }, [stompClient]);

  useEffect(() => {
    if (!stompClient) return;
  
    const subscription = stompClient.subscribe('/topic/messages', (message) => {
      console.log('Received message from server', message);
      const newMessage = JSON.parse(message.body);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, [stompClient]);

  //#endregion

  //#region movement

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const inputElements = ['input', 'textarea', 'select'];
  
      // Check if the event target is an input element
      const isInputElement = inputElements.includes((e.target as HTMLElement).tagName.toLowerCase());
  
      // If the event target is an input element, return early without reacting
      if (isInputElement) {
          return;
      }
      keysPressed.current[e.key] = true;
  
      // Otherwise, proceed with your key press handling logic
      // For example:
      console.log('Key pressed:', e.key);
      // Add your key press handling logic here
  }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);  

  useEffect(() => {
    if (!stompClient || !playerSpawned) return;
  
    const handleMovement = () => {
      const directions = ['w', 'a', 's', 'd'];
      const pressedKeys = directions.filter(direction => keysPressed.current[direction]);
      if (pressedKeys.length > 0) {
        const directionsToSend = pressedKeys.map(key => directionMap[key]);
        stompClient.send('/app/move', {}, JSON.stringify({ playerName: playerName, directions: directionsToSend }));
        console.log("Sending move request:", directionsToSend);
      }
    };
  
    handleMovement(); // Check initially
  
    const movementInterval = setInterval(() => {
      handleMovement(); // Check periodically
    }, 100);
  
    return () => {
      clearInterval(movementInterval); // Cleanup
    };
  }, [playerName, playerSpawned, stompClient]);  

//#endregion

  const sendMessage = (messageContent) => {
    if (!stompClient) return;
    const newMessage = {
      sender: playerName,
      content: messageContent,
    };
    stompClient.send('/topic/messages', {}, JSON.stringify(newMessage));
  };
  
  const handleSpawnPlayer = () => {
    if (!stompClient || !playerName.trim()) return;

    const initialPlayer = {
      name: playerName.trim(),
      position: { x: 200, y: 200 }, // Initial spawn position
    };

    stompClient.send('/app/setPlayer', {}, JSON.stringify(initialPlayer));
    setPlayerSpawned(true);

    // Redirect to the game page after spawning player
    history.push('/game');
  };

  return (
    <div style={{ padding: '20px' }}>
      {!playerSpawned && (
        <div className={styles.loginbackground}>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40%' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              style={{ padding: '10px', margin: '2px' }}
            />
            <button onClick={handleSpawnPlayer}>Spawn Player</button>
          </div>
          
        </div>
      )}
      {playerSpawned && (
        <div>
        <Lobby players={players} />

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
      </div>     
  );
};

export default App;


