import React, { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Lobby from './components/Lobby'; 

const App = ({ history }) => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const [playerSpawned, setPlayerSpawned] = useState(false); 

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

  const sendTestMoveRequest = () => {
    // Simulate a test move request with a predefined playerName and direction
    const testPlayerName = 'TestPlayer';
    const testDirection = 'UP';

    stompClient.send('/app/move', {}, JSON.stringify({ playerName: testPlayerName, direction: testDirection }));
    console.log("Sending test move request...");
  };

  useEffect(() => {
    if (stompClient && playerSpawned) {
      sendTestMoveRequest(); // Send test move request after player is spawned
    }
  }, [stompClient, playerSpawned]);

  const handleKeyDown = useCallback((e) => {
    if (!stompClient || !players[playerName]) return;
    console.log("Player name:", playerName); // Add this line to check playerName


    const directionMap = {
        'w': 'UP',
        'a': 'LEFT',
        's': 'DOWN',
        'd': 'RIGHT'
    };

    const direction = directionMap[e.key];
    if (direction) {
        const movementRequest = {
            direction: direction
        };

        stompClient.send('/app/move', {}, JSON.stringify({ playerName: playerName, direction: direction }));
        console.log("Sending Data to backend");
    }
  }, [stompClient, players, playerName]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (!stompClient) return;

    stompClient.subscribe('/topic/players', (message) => {
      const updatedPlayers = JSON.parse(message.body);
      console.log("Updated players:", updatedPlayers); // Add this line to check updatedPlayers
    
      setPlayers(updatedPlayers);
    });
  }, [stompClient]);

  return (
    <div style={{ padding: '20px' }}>
    
      {!playerSpawned && (
        
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
      )}
      
      <Lobby players={players}/>
    </div>
  );
};

export default App;
