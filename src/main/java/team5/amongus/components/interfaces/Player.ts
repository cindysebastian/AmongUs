interface Player {
  name: string;
  position: {
    x: number;
    y: number;
  };
  facing?: 'LEFT' | 'RIGHT'; // Optional facing property
  isMoving?: boolean; // Optional ismoving property
  //isDead?: boolean; // for dead body 
  isImposter? : boolean; // for imposter
  host? : boolean;
  willContinue?: boolean; // for continue game

}
export default Player