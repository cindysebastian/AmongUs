// Player interface
export default interface Player {
  name: string;
  position: {
    x: number;
    y: number;
  };
  step: number;
  isMoving?: boolean;
  facing?: 'LEFT' | 'RIGHT';
  width: number;
  height: number;
  canInteract: boolean;
  isAlive: boolean;
  willContinue?: boolean;
  lastActivityTime: number;
  sessionId: string;
  isHost?: boolean;
  isImposter?: boolean;
  canKill?: boolean;
}

export interface PlayersMap {
  [key: string]: Player;
}