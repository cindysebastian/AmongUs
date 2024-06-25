// WebSocketService.ts
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { handleReceivedInteractibles } from './InteractionService';
import { handleReceivedSabotageTasks } from './SabotageInteractionService';
import { PlayersMap } from '../components/interfaces/Player';

export const connectWebSocket = (setStompClient, setStompChatClient) => {
  // Disable Stomp.js logging

  const socket = new SockJS('http://localhost:8080/ws');
  const socketChat = new SockJS('http://localhost:8080/ws')

  const stomp = Stomp.over(socket);
  stomp.debug = null;

  const stompChat = Stomp.over(socketChat);
  stompChat.debug = null;

  stomp.connect({}, () => {
    console.log('[WebsocketService.ts] Connected to WebSocket on port 8080');
    setStompClient(stomp);
  });

  stompChat.connect({}, () => {
    console.log('[WebsocketService.ts] Connected to WebSocket on port 8082');
    setStompChatClient(stompChat);
  });
  
  return () => {
    if (stomp) {
      stomp.disconnect(() => { });
      console.log('[WebsocketService.ts] Disconnected from WebSocket on port 8080');
    }
    if (setStompChatClient) {
      setStompChatClient.disconnect(() => { });
      console.log('[WebsocketService.ts] Disconnected from WebSocket on port 8082');
    }
  };
};

export const subscribeToPlayers = (stompClient, playerName, setPlayers, setInGamePlayers, roomCode) => {
  if (!stompClient || !playerName || !roomCode) {
    console.error("[WebsocketService.ts] Missing required parameters for subscription:", { stompClient, playerName, roomCode });
    return;
  }

  stompClient.subscribe(`/topic/players/${roomCode}`, (message: { body: string }) => {
    try {
      console.log('[WebsocketService.ts] ' + message.body);
      const updatedPlayers = JSON.parse(message.body);
      const playersWithImposterFlag = addImposterFlag(updatedPlayers);
      setPlayers(playersWithImposterFlag);
      const currentPlayer = playersWithImposterFlag[playerName];
      console.log('[WebsocketService.ts] ' + playersWithImposterFlag);
    } catch (error) {
      console.error('[WebsocketService.ts] Error processing player message:', error);
    }
  });

  stompClient.subscribe(`/topic/inGamePlayers/${roomCode}`, (message: { body: string }) => {
    try {
      const updatedInGamePlayers = JSON.parse(message.body);
      const inGamePlayersWithImposterFlag = addImposterFlag(updatedInGamePlayers);
      setInGamePlayers(inGamePlayersWithImposterFlag);
      const currentPlayer = inGamePlayersWithImposterFlag[playerName];
    } catch (error) {
      console.error('[WebsocketService.ts] Error processing in-game player message:', error);
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

export const subscribeToMessages = (stompChatClient, setMessages, roomCode) => {
  if (!stompChatClient) return;

  const subscription = stompChatClient.subscribe(`/topic/messages/${roomCode}`, (message) => {
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
    console.log('[WebsocketService.ts] Received message:', message.body); // Log the message body
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

export const markSabotageTaskAsCompleted = (stompClient, interactibleId: number, roomCode) => {
  if (!stompClient) return;

  const messageBody = {
    interactibleId: interactibleId
  };

  stompClient.send(`/app/completeSabotageTask/${roomCode}`, {}, JSON.stringify(messageBody));
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
    console.log(updatedInteractibles);
    handleReceivedInteractibles(updatedInteractibles, setInteractibles);
    
  });
};

export const subscribeToInteractionWithSabotage = (stompClient, setSabotageTasks, roomCode) => {
  if (!stompClient) return;

  stompClient.subscribe(`/topic/sabotages/${roomCode}`, (message) => {
    const updatedSabotageTasks = JSON.parse(message.body); 
    setSabotageTasks(updatedSabotageTasks);
    handleReceivedSabotageTasks(updatedSabotageTasks, setSabotageTasks);
  });
};

export const sendInteraction = (stompClient, playerName, roomCode) => {
  if (!stompClient || !playerName) return;

  stompClient.send(`/app/interact//${roomCode}`, {}, playerName);
};

export const sendInteractionWithSabotageTask = (stompClient, playerName, roomCode) => {
  if (!stompClient || !playerName) return;

  stompClient.send(`/app/interactWithSabotage/${roomCode}`, {}, playerName);
}

export const sendChatMessage = (stompChatClient, playerName, messageContent, roomCode) => {
  if (!stompChatClient || !playerName) return;

  const newMessage = {
    sender: playerName,
    content: messageContent,
    roomCode: roomCode
  };

  stompChatClient.send(`/topic/messages/${roomCode}`, {}, JSON.stringify(newMessage));
};

export const killPlayer = (stompClient, playerName, roomCode) => {
  if (!stompClient || !playerName.trim()) return;

  stompClient.send(`/app/killPlayer/${roomCode}`, {}, playerName);
};

export const enableSabotage = (stompClient, sabotage, roomCode) => {
  if(!stompClient) return;

  stompClient.send(`/app/enableSabotage/${roomCode}`, {}, sabotage)
}

export const subscribeToEjectedPlayer = (stompClient, roomCode, setEjectedPlayer, setShowEjectedGif) => {
  if (!stompClient) return;

  const subscription = stompClient.subscribe(`/topic/ejectedPlayer/${roomCode}`, (message) => {
    const ejectedPlayer = message.body;
    setEjectedPlayer(ejectedPlayer);
    setShowEjectedGif(true); // Set showEjectedGif to true when a player is ejected
  });
  return () => {
    subscription.unsubscribe();
  };
};

export const sendVote = (stompClient, playerName, votedPlayer, roomCode) => {
  if (!stompClient || !playerName) return;

  const payload = `${playerName},${votedPlayer}`;
  stompClient.send(`/app/vote/${roomCode}`, {}, payload);
};

