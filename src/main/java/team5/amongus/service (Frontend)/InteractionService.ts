// InteractionService.ts

import { sendInteraction } from "./WebsocketService";


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

  

  