import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Lobby from './components/Lobby';
import Map from './components/Space';
import bgImage from '../../../resources/LoginBG.png';

const App = ({ history }) => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [playerSpawned, setPlayerSpawned] = useState(false);
  const [prevPlayerPositions, setPrevPlayerPositions] = useState({});
  const [isMoving, setIsMoving] = useState(false);

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
    if (!stompClient) return;

    stompClient.subscribe('/topic/players', (message) => {
      const updatedPlayers = JSON.parse(message.body);
      console.log("Updated players:", updatedPlayers);
      // Check for movement and update player positions
      const updatedPositions = {};
      Object.keys(updatedPlayers).forEach(playerName => {
        if (prevPlayerPositions[playerName].x === updatedPlayers[playerName].position.x &&
            prevPlayerPositions[playerName].y === updatedPlayers[playerName].position.y) {
          updatedPlayers[playerName].isMoving = false;
        } else {
          updatedPlayers[playerName].isMoving = true;
        }
        updatedPositions[playerName] = updatedPlayers[playerName].position;
      });
      setPlayers(updatedPlayers);
      setPrevPlayerPositions(updatedPositions);
    });
  }, [stompClient, prevPlayerPositions]);

  useEffect(() => {
    const handleKeyPress = (e) => {
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

  
  const directionMap = {
    'w': 'UP',
    'a': 'LEFT',
    's': 'DOWN',
    'd': 'RIGHT'
  };

  useEffect(() => {
    if (!stompClient || !playerSpawned) return;
  
    const handleMovement = () => {
      const directions = ['w', 'a', 's', 'd'];
      const pressedKeys = directions.filter(direction => keysPressed.current[direction]);
      const isMovingNow = pressedKeys.length > 0;
      if (isMovingNow !== isMoving) {
        setIsMoving(isMovingNow);
      }
      if (isMovingNow) {
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
  }, [playerName, playerSpawned, stompClient, isMoving]);
  
  
  

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
      console.log("Updated players:", updatedPlayers);
      setPlayers(updatedPlayers);
    });
  }, [stompClient]);

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
            zIndex: -1,
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
    </div>
  );
};

export default App;
