interface Player {
  name: string;
  position: {
    x: number;
    y: number;
  };
  isMoving: boolean;
  direction: 'left' | 'right'; // Up and down are irrelevant for animation; This property is ONLY for animation purposes
}

export default Player;
