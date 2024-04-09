import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import ChatRoom from './components/ChatRoom';
import MessageInput from './components/MessageInput';

const App = () => {
  const [stompClient, setStompClient] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState({});
  const[messages, setMessages] = useState([]);
  const[chatVisible, setChatVisible] = useState(false);

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
    const isInputFocused = document.activeElement.tagName.toLowerCase() === 'input';
    if (isInputFocused) return;
    if (isInputFocused || !stompClient || !players[playerName]) return;

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
      <div style={{ position: 'relative', width: '100%', height: '80vh', backgroundColor: '#f0f0f0' }}>
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
