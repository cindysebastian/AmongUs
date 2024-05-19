interface Interactible {
  completed: boolean;
  id: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  inProgress: boolean;
  type: TaskType;
  assignedPlayer: String;
  buttonsClicked?: boolean[]; // New property to track button clicks
}

enum TaskType {
  SWIPE = "SWIPE",
  MINE = "MINE",
  SCAN = "SCAN"
}


export default Interactible