// TaskService.ts

import Stomp from 'stompjs';
import { markTaskAsCompleted } from './WebsocketService';
import Interactible from '../components/interfaces/Interactible';


export const completeMiniGame = (stompClient, interactibleId: number) => {
  if (!stompClient) return;

  // Call function to send completed state to backend
  markTaskAsCompleted(stompClient, interactibleId);
};

export const getRequiredButtonClicks = (interactible: Interactible): number => {
  switch (interactible.type) {
    case 'SWIPE':
      return 1;
    case 'MINE':
      return 5; // Adjust as per the requirement of MineMinigame
    case 'SCAN':
      return 3;
    default:
      return 0;
  }
};
