import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const App = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [stompClient, setStompClient] = useState(null);

  useEffect(() => {
    // Connect to WebSocket endpoint
    const socket = new SockJS('http://localhost:8080/ws');
    const stomp = Stomp.over(socket);
    stomp.connect({}, () => {
      console.log('Connected to WebSocket');
      setStompClient(stomp);
    });

    // Cleanup function
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    // Subscribe to WebSocket topic to receive player position updates
    if (stompClient) {
      stompClient.subscribe('/topic/player-position', (message) => {
        const newPosition = JSON.parse(message.body);
        setPosition(newPosition);
      });
    }
  }, [stompClient]);

  const handleKeyDown = (e) => {
    if (!stompClient) return;

    const newPosition = { ...position };
    switch (e.key) {
      case 'w':
        newPosition.y -= 10;
        break;
      case 'a':
        newPosition.x -= 10;
        break;
      case 's':
        newPosition.y += 10;
        break;
      case 'd':
        newPosition.x += 10;
        break;
      default:
        return;
    }

    // Send updated position to server
    stompClient.send('/app/move', {}, JSON.stringify(newPosition));
  };

  useEffect(() => {
    // Add event listener for keydown
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      style={{
        position: 'relative',
        width: '500px',
        height: '500px',
        border: '1px solid black',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      ></div>
    </div>
  );
};

export default App;
