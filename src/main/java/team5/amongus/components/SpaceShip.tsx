import React, { useState } from 'react';
import Player from './interfaces/Player'; // Import the Player interface
import PlayerSprite from './PlayerSprite';
import styles from '../../amongus/spaceship.module.css';
import Interactible from './interfaces/Interactible';

interface Props {
  players: Record<string, Player>;
  interactibles: Interactible[];
}

const SpaceShip: React.FC<Props> = ({ players, interactibles }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState<JSX.Element | null>(null);

  // Function to handle button click inside the popup
  const handleButtonClick = () => {
    // Do something when the button inside the popup is clicked
    // Here, I'm just closing the popup
    setShowPopup(false);
  };

  // Function to render different popup content based on the interactable object
  const renderPopupContent = (interactible: Interactible) => {
    // Check the properties of the interactable object and render different content accordingly
    if (interactible.type === 'SWIPE') {
      return (
        <div>
          <p>This is popup type 1!</p>
          <button onClick={handleButtonClick}>Close</button>
        </div>
      );
    } else if (interactible.type === 'MINE') {
      return (
        <div>
          <p>This is popup type 2!</p>
          <button onClick={handleButtonClick}>Close</button>
        </div>
      );
    } else if (interactible.type === 'SCAN') {
      return (
        <div>
          <p>This is popup type 3!</p>
          <button onClick={handleButtonClick}>Close</button>
        </div>
      );
    } else {
      // Default popup content if the interactible type is not recognized
      return (
        <div>
          <p>Unknown popup type!</p>
          <button onClick={handleButtonClick}>Close</button>
        </div>
      );
    }
  };

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
              <div className={styles.interactible} style={{ width: interactible.width, height: interactible.height, backgroundColor: 'pink' }}>
                {/* Check if the interactible is in progress and show the popup */}
                {interactible.inProgress && (
                  <div className={styles.popup}>
                    <div className={styles.popupContent}>
                      {renderPopupContent(interactible)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceShip;
