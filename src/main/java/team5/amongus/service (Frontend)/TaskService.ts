// TaskService.ts

import { markTaskAsCompleted } from '../service (Frontend)/WebsocketService';
import Interactible from '../components/interfaces/Interactible';
import Stomp from 'stompjs';

export const handleButtonClick = (stompClient: Stomp.Client | null, interactibleId: number, buttonIndex: number, interactibles: Interactible[]) => {
    if (!stompClient) return;
  
    // If all buttons are clicked, send a message to the backend
    markTaskAsCompleted(stompClient, interactibleId);
  };
  
  export const getRequiredButtonClicks = (interactibleId: number, interactibles: Interactible[]) => {
    const interactible = interactibles.find(interactible => interactible.id === interactibleId);
    if (!interactible) return 0;
    switch (interactible.type) {
      case 'SWIPE':
        return 1;
      case 'MINE':
        return 2;
      case 'SCAN':
        return 3;
      default:
        return 0;
    }

};
