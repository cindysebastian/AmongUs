interface SabotageTask {
    id: number,
    completed: boolean,
    inProgress: boolean,
    width: number,
    height: number,
    position: {x: number, y: number};
  }  
  
  export default SabotageTask