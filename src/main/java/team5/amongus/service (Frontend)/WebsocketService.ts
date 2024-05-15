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
  console.log("Sending request to complete Task to Backend")
  console.log(interactibleId)
  stompClient.send('/app/completeTask', {}, messageBody);
};




export const subscribetoInteractions = (stompClient, setInteractibles) => {
  if (!stompClient) return;
  console.log("Subscribing to Interactibles");
  
  stompClient.subscribe('/topic/interactions', (message) => {
    const updatedInteractibles = JSON.parse(message.body);
    setInteractibles(updatedInteractibles);
    handleReceivedInteractibles(updatedInteractibles, setInteractibles);

  });

 
};

export const sendInteraction = (stompClient, playerName) => {
  if (!stompClient || !playerName) return;
  console.log("Updating Interactibles");


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
    position: { x: 200, y: 200 }, // Initial spawn position
  };

  stompClient.send('/app/setPlayer', {}, JSON.stringify(initialPlayer));
};
