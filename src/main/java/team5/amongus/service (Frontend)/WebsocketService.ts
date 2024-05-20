// WebSocketService.ts

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { handleReceivedInteractibles } from './InteractionService';

// Disable Stomp.js logging



export const connectWebSocket = (setStompClient) => {
  // Disable Stomp.js logging
 

  const socket = new SockJS('http://localhost:8080/ws');
  const stomp = Stomp.over(socket);
  stomp.debug = function (){};//do nothing

  stomp.connect({}, () => {
    console.log('Connected to WebSocket');
    setStompClient(stomp);
  });

  return () => {
    if (stomp) {
      stomp.disconnect(() => { }); // Provide an empty function as disconnectCallback
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
  });

  stompClient.subscribe('/topic/inGamePlayers', (message) => {
    const updatedinGamePlayers = JSON.parse(message.body);
    setInGamePlayers(updatedinGamePlayers);
    const currentPlayer = updatedinGamePlayers[playerName];
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

export const markTaskAsCompleted = (stompClient, interactibleId: number) => {
  if (!stompClient) return;

  // Construct the message body
  const messageBody = {
      interactibleId: interactibleId
  };

  // Send a STOMP message to your backend to mark the task as completed

  stompClient.send('/app/completeTask', {}, JSON.stringify(messageBody));
};




export const subscribetoInteractions = (stompClient, setInteractibles) => {
  if (!stompClient) return;

  
  stompClient.subscribe('/topic/interactions', (message) => {
    const updatedInteractibles = JSON.parse(message.body);
    setInteractibles(updatedInteractibles);
    handleReceivedInteractibles(updatedInteractibles, setInteractibles);

  });

 
};

export const sendInteraction = (stompClient, playerName) => {
  if (!stompClient || !playerName) return;


  stompClient.send('/app/interact', {},playerName);
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
    position: { x: 400, y: 400 }, // Initial spawn position
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

export const fetchCollisionMask = async () => {
  try {
    const response = await fetch('/app/collisionmask'); // Adjust the endpoint as per your backend
    if (response.ok) {
      const maskData = await response.json();
      return maskData;
    } else {
      throw new Error('Failed to fetch collision mask');
    }
  } catch (error) {
    console.error('Error fetching collision mask:', error);
    return null;
  }
};
