// TaskService.ts

import Stomp from 'stompjs';
import { markTaskAsCompleted } from './WebsocketService';
import Task from '../components/interfaces/Interactible';


export const completeMiniGame = (stompClient, interactibleId: number, roomCode) => {
  if (!stompClient) return;

  // Call function to send completed state to backend
  markTaskAsCompleted(stompClient, interactibleId, roomCode);
};

export const getRequiredButtonClicks = (interactible: Task): number => {
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
