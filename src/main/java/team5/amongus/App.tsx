import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Map from './components/Map'; 
import GamePage from './components/GamePage'; 

const App = ({ history }) => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [playerSpawned, setPlayerSpawned] = useState(false); // New state to track player spawning


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
    setPlayerSpawned(true);

    // Redirect to the game page after spawning player
    history.push('/game');
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
    
      {/* Conditionally render input and button based on playerSpawned state */}
      {!playerSpawned && (
        
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
      )}
      
      {/* Render the GamePage component and pass players as a prop */}
      <GamePage players={players} handleKeyDown={handleKeyDown} />
    </div>
  );
};


export default App;
