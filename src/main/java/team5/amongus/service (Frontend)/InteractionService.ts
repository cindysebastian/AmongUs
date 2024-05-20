// InteractionService.ts

import { sendInteraction } from "./WebsocketService";

export const handleInteraction = (stompClient, playerName) => {
    if (!stompClient || !playerName) return;
  
    // Add logic to determine the interactable object the player is interacting with
  
    // Assuming you have determined the interactable object, send the interaction to the backend
    sendInteraction(stompClient, playerName);
  };


  // When receiving interactibles from the backend
export const handleReceivedInteractibles = (interactiblesData, setInteractibles) => {

  const parsedInteractibles = interactiblesData.map((data) => {   
    
    return {
      id: data.id,
      completed: data.taskCompleted,
      position: data.position,
      width: data.width,
      height: data.height,
      inProgress: data.inProgress,
      type: data.type,
      assignedPlayer: data.assignedPlayer, 
    };
  });

  setInteractibles(parsedInteractibles);
};

  

  