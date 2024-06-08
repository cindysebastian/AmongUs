import Sabotage from "./Sabotage";

interface SabotageTask {
  id: number,
  completed: boolean,
  inProgress: boolean,
  width: number,
  height: number,
  position: {x: number, y: number};
  sabotage: Sabotage;
}  

export default SabotageTask