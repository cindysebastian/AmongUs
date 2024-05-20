// WebSocketService.ts

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const connectWebSocket = (setStompClient) => {
  const socket = new SockJS('http://localhost:8080/ws');
  const stomp = Stomp.over(socket);

  stomp.connect({}, () => {
    console.log('Connected to WebSocket');
    setStompClient(stomp);
  });

  return () => {
    if (stomp) {
      stomp.disconnect(() => {}); // Provide an empty function as disconnectCallback
      console.log('Disconnected from WebSocket');
    }
  };
};

export const subscribeToPlayers = (stompClient, playerName, setPlayers, setInGamePlayers) => {
  if (!stompClient || !playerName) return;

  stompClient.subscribe('/topic/players', (message) => {
    const updatedPlayers = JSON.parse(message.body);
    setPlayers(updatedPlayers);
    const currentPlayer = updatedPlayers[playerName];

    // Your logic related to player updates can go here
  });

  stompClient.subscribe('/topic/inGamePlayers', (message) => {
    const updatedinGamePlayers = JSON.parse(message.body);
    setInGamePlayers(updatedinGamePlayers);
    const currentPlayer = updatedinGamePlayers[playerName];
  });
};

export const subscribeToMessages = (stompClient, setMessages) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe('/topic/messages', (message) => {
    const newMessage = JSON.parse(message.body);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  });

  return () => {
    subscription.unsubscribe();
  };
};

export const sendInteraction = (stompClient, playerName) => {
  if (!stompClient || !playerName) return;

  stompClient.send('/app/interaction', {}, JSON.stringify({ playerName: playerName }));
};

export const sendChatMessage = (stompClient, playerName, messageContent) => {
  if (!stompClient || !playerName) return;

  const newMessage = {
    sender: playerName,
    content: messageContent,
  };

  stompClient.send('/topic/messages', {}, JSON.stringify(newMessage));
};

export const setPlayer = (stompClient, playerName) => {
  if (!stompClient || !playerName.trim()) return;

  const initialPlayer = {
    name: playerName.trim(),
    position: { x: 200, y: 200 }, // Initial spawn position
  };

  stompClient.send('/app/setPlayer', {}, JSON.stringify(initialPlayer));
};

export const killPlayer = (stompClient, playerName) => {
  if (!stompClient || !playerName.trim()) return;

  stompClient.send('/app/killPlayer', {}, playerName);
};

export const subscribeToPlayerKilled = (stompClient, setPlayerKilled) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe('/topic/killedPlayer', (message) => {
      const killedPlayer = JSON.parse(message.body);
      setPlayerKilled(killedPlayer);
  });

  return () => {
      subscription.unsubscribe();
  };
};

export const subscribeToImposter = (stompClient, setIsImposter) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe('/topic/isImposter', (message) => {
    const isImposter = JSON.parse(message.body);
    setIsImposter(isImposter.name); 
  });

  return () => {
    subscription.unsubscribe();
  };
};

