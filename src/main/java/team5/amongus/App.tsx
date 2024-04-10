import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';
import Lobby from './components/Lobby';
import Map from './components/Space';
import bgImage from '../../../resources/LoginBG.png';

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
    const handleKeyPress = (e) => {
      const isInputFocused = document.activeElement.tagName.toLowerCase() === 'input';
      if (isInputFocused) return;
      if (isInputFocused || !stompClient || !players[playerName]) return;
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e) => {
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
  

  const sendMoveRequest = (key) => { // Removed TypeScript syntax
    if (!stompClient || !playerName) {
      console.log("Stomp client or playerName not available.");
      return;
    }

    const direction = directionMap[key];
    console.log("Direction:", direction);

    if (!direction) {
      console.log("Direction not found in the direction map.");
      return; // Ignore keys not in the direction map
    }

    stompClient.send('/app/move', {}, JSON.stringify({ playerName: playerName, direction: direction }));
    console.log("Sending move request...");
  };


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
        <div
          className="map-background"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            zIndex: 0,
            backgroundPosition: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40%' }}>
            <Map />
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
        <Lobby players={players} />
      )}
      <button onClick={() => setChatVisible(!chatVisible)} style={{ marginTop: '20px', padding: '8px 16px', fontSize: '16px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Chat</button>
      {chatVisible && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '5000px',
          width: '1000px',
          height: '600px',
          maxHeight: '400px', // Example fixed height
          overflowY: 'auto', // Add vertical scrollbar if content overflows
        }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ color: 'white', margin: '0' }}>Chat</h2>
          </div>
          <button style={{ position: 'absolute', top: '10px', right: '10px',marginRight:'10px', padding: '8px 20px', fontSize: '16px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setChatVisible(false)}>Exit</button>
          <MessageInput sendMessage={sendMessage} chatVisible={chatVisible} />
          <ChatRoom messages={messages} />
        </div>
      )}
        
      </div>
        
      
  );
};

export default App;


