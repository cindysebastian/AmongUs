interface Interactible {
  completed: boolean;
  id: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  inProgress: boolean;
  type: TaskType;
  assignedPlayer: String;
}

enum TaskType {
  SWIPE = "SWIPE",
  MINE = "MINE",
  SCAN = "SCAN"
}


export default Interactible