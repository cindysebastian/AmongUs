import React, { useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Player = ({ position }) => {
  return (
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
  );
};

const Square = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  let stompClient;

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
    });

    return () => {
      stompClient.disconnect();
    };
  }, []);

  const handleMove = (e) => {
    switch (e.key) {
      case 'w':
        setPosition(prevPosition => ({ ...prevPosition, y: prevPosition.y - 10 }));
        break;
      case 'a':
        setPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x - 10 }));
        break;
      case 's':
        setPosition(prevPosition => ({ ...prevPosition, y: prevPosition.y + 10 }));
        break;
      case 'd':
        setPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x + 10 }));
        break;
      default:
        break;
    }
    stompClient.send("/app/move", {}, JSON.stringify(position));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleMove);

    return () => {
      window.removeEventListener('keydown', handleMove);
    };
  }, []);

  return <Player position={position} />;
};

export default Square;