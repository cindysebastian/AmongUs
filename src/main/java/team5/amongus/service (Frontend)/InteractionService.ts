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
    // Extract player information from the data received from the backend
    const player = data.assignedPlayer; // Assuming player information is directly available

    // Create the interactible object with the extracted player information
    return {
      id: data.id,
      position: data.position,
      width: data.width,
      height: data.height,
      inProgress: data.inProgress,
      type: data.type,
      assignedPlayer: player, // Assign the extracted player information to the player property
    };
  });

  // Set the interactibles state with the parsed interactibles
  setInteractibles(parsedInteractibles);
};

  

  