import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Map from './components/Map'; 
const App = () => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});

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

  const handleSpawnPlayer = () => {
    if (!stompClient || !playerName.trim()) return;

    const initialPlayer = {
      name: playerName.trim(),
      position: { x: 200, y: 200 }, // Initial spawn position
    };

    stompClient.send('/app/setPlayer', {}, JSON.stringify(initialPlayer));
  };

  const handleKeyDown = (e) => {
    if (!stompClient || !players[playerName]) return;

    const newPosition = { ...players[playerName].position };
    const movementAmount = 10;

    switch (e.key) {
      case 'w':
        newPosition.y -= movementAmount;
        break;
      case 'a':
        newPosition.x -= movementAmount;
        break;
      case 's':
        newPosition.y += movementAmount;
        break;
      case 'd':
        newPosition.x += movementAmount;
        break;
      default:
        return;
    }

    const updatedPlayer = {
      name: playerName,
      position: newPosition,
    };

    stompClient.send('/app/move', {}, JSON.stringify(updatedPlayer));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [stompClient, players, playerName]);

  useEffect(() => {
    if (!stompClient) return;

    stompClient.subscribe('/topic/players', (message) => {
      const updatedPlayers = JSON.parse(message.body);
      setPlayers(updatedPlayers);
    });
  }, [stompClient]);

  return (
    <div style={{ padding: '20px' }}>
      <div>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={handleSpawnPlayer}>Spawn Player</button>
      </div>
      <Map />
      
        {Object.keys(players).map((name) => (
          <div
            key={name}
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: name === playerName ? 'blue' : 'red',
              position: 'absolute',
              top: `${players[name].position.y}px`,
              left: `${players[name].position.x}px`,
            }}
          >
            {name}
          </div>
        ))}
        
    </div>
  );
};

export default App;
