// WebSocketService.ts

import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { handleReceivedInteractibles } from './InteractionService';


export const connectWebSocket = (setStompClient) => {
  // Disable Stomp.js logging


  const socket = new SockJS('http://localhost:8080/ws');
  const stomp = Stomp.over(socket);
  stomp.debug = null;

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

export const subscribeToPlayers = (stompClient, playerName, setPlayers, setInGamePlayers, roomCode) => {
  if (!stompClient || !playerName || !roomCode) {
    console.error("Missing required parameters for subscription:", { stompClient, playerName, roomCode });
    return;
  }

  stompClient.subscribe(`/topic/players/${roomCode}`, (message) => {
    try {
      const updatedPlayers = JSON.parse(message.body);
      const playersWithImposterFlag = addImposterFlag(updatedPlayers);
      setPlayers(playersWithImposterFlag);
      const currentPlayer = playersWithImposterFlag[playerName];
    } catch (error) {
      console.error('Error processing player message:', error);
    }
  });

  stompClient.subscribe(`/topic/inGamePlayers/${roomCode}`, (message) => {
    try {
      const updatedInGamePlayers = JSON.parse(message.body);
      const inGamePlayersWithImposterFlag = addImposterFlag(updatedInGamePlayers);
      setInGamePlayers(inGamePlayersWithImposterFlag);
      const currentPlayer = inGamePlayersWithImposterFlag[playerName];
    } catch (error) {
      console.error('Error processing in-game player message:', error);
    }
  });
};


const addImposterFlag = (playersMap) => {
  return Object.keys(playersMap).reduce((acc, key) => {
    const player = playersMap[key];

    // Example condition to identify imposters
    if (player.canKill != null) {
      player.isImposter = true;
    } else {
      player.isImposter = false;
    }

    acc[key] = player;
    return acc;
  }, {});
};

// Player interface
export default interface Player {
  name: string;
  position: {
    x: number;
    y: number;
  };
  facing?: 'LEFT' | 'RIGHT';
  isMoving?: boolean;
  isImposter?: boolean;
}


export const subscribeToMessages = (stompClient, setMessages, roomCode) => {
  if (!stompClient) return;


  const subscription = stompClient.subscribe(`/topic/messages/${roomCode}`, (message) => {
    const newMessage = JSON.parse(message.body);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  });

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribetoGameFinishing = (stompClient, setGameWonState, roomCode) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe(`/topic/finishGame/${roomCode}`, (message) => {
    console.log('Received message:', message.body); // Log the message body
    const gameWonStateMessage = message.body;
    setGameWonState(gameWonStateMessage);
  });

  return () => {
    subscription.unsubscribe();
  };
};


export const markTaskAsCompleted = (stompClient, interactibleId: number, roomCode) => {
  if (!stompClient) return;

  // Construct the message body
  const messageBody = {
    interactibleId: interactibleId
  };

  // Send a STOMP message to your backend to mark the task as completed

  stompClient.send(`/app/completeTask/${roomCode}`, {}, JSON.stringify(messageBody));
};

export const subscribeToPlayerKilled = (stompClient, setPlayerKilled, roomCode) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe(`/topic/killedPlayer/${roomCode}`, (message) => {
    const killedPlayer = JSON.parse(message.body);
    setPlayerKilled(killedPlayer);
  });

  return () => {
    subscription.unsubscribe();
  };
};




export const subscribetoInteractions = (stompClient, setInteractibles, roomCode) => {
  if (!stompClient) return;


  stompClient.subscribe(`/topic/interactions/${roomCode}`, (message) => {
    const updatedInteractibles = JSON.parse(message.body);
    setInteractibles(updatedInteractibles);
    handleReceivedInteractibles(updatedInteractibles, setInteractibles);

  });


};

export const sendInteraction = (stompClient, playerName, roomCode) => {
  if (!stompClient || !playerName) return;


  stompClient.send(`/app/interact//${roomCode}`, {}, playerName);
};

export const sendChatMessage = (stompClient, playerName, messageContent, roomCode) => {
  if (!stompClient || !playerName) return;

  const newMessage = {
    sender: playerName,
    content: messageContent,
    roomCode: roomCode
  };

  stompClient.send(`/topic/messages/${roomCode}`, {}, JSON.stringify(newMessage));
};


export const killPlayer = (stompClient, playerName, roomCode) => {
  if (!stompClient || !playerName.trim()) return;

  stompClient.send(`/app/killPlayer/${roomCode}`, {}, playerName);
};



