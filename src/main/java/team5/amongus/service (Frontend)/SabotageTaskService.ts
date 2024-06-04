// TaskService.ts

import Stomp from 'stompjs';
import { markSabotageTaskAsCompleted } from './WebsocketService';


export const completeSabotageMiniGame = (stompClient, interactibleId: number, roomCode) => {
  if (!stompClient) return;

  // Call function to send completed state to backend
  markSabotageTaskAsCompleted(stompClient, interactibleId, roomCode);
};
