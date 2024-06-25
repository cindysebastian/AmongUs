import Player from "./Player";

interface Interactible {
  found?: boolean;
  completed?: boolean;
  id: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  inProgress?: boolean;
  type?: TaskType;
  assignedPlayer?: String;
  inMeeting?: boolean;
  ejectedPlayer?: Player;
  votes?: { [key: string]: number }; // Add the votes map
  isCooldownActive?: boolean;
}

enum TaskType {
  SWIPE = "SWIPE",
  MINE = "MINE",
  SCAN = "SCAN",
}

export default Interactible;
