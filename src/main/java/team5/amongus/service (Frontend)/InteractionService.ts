// InteractionService.ts

import { sendInteraction } from "./WebsocketService";

export const handleInteraction = (stompClient, playerName) => {
    if (!stompClient || !playerName) return;
  
    // Add logic to determine the interactable object the player is interacting with
  
    // Assuming you have determined the interactable object, send the interaction to the backend
    sendInteraction(stompClient, playerName);
  };
  