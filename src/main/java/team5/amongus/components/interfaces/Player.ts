interface Player {
  name: string;
  position: {
    x: number;
    y: number;
  };
  facing?: 'LEFT' | 'RIGHT'; // Optional facing property
  ismoving?: boolean; // Optional ismoving property
}
export default Player