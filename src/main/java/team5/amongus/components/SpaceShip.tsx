import React from 'react';
import Player from './interfaces/Player'; // Import the Player interface
import PlayerSprite from './PlayerSprite';
import styles from '../../amongus/spaceship.module.css';
import Interactible from './interfaces/Interactible';

interface Props {
  players: Record<string, Player>;
  interactibles: Interactible[];
}

const SpaceShip: React.FC<Props> = ({ players, interactibles }) => {
  return (
    <div>
      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
        {/* Render players */}
        {Object.values(players).map(player => (
          <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
            {/* Render each player's sprite */}
            <PlayerSprite
              player={player}
              facing={player.facing !== undefined ? player.facing : 'RIGHT'}
              isMoving={player.isMoving !== undefined ? player.isMoving : false}
            />
          </div>
        ))}
      

      {/* Render interactibles */}
      <div>
        {interactibles.map(interactible => (
          <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y, left: interactible.position.x, zIndex: 1 }}>
            <div className={styles.interactible} style={{ width: interactible.width, height: interactible.height, backgroundColor: 'pink' }}></div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default SpaceShip;