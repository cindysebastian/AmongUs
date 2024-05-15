interface Interactible {
    id: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    inProgress: Boolean;
    type: TaskType;
  }

  enum TaskType {
    SWIPE = "SWIPE",
    MINE = "MINE",
    SCAN = "SCAN"
}


  export default Interactible