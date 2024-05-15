import React, { useState } from 'react';
import Player from './interfaces/Player'; // Import the Player interface
import PlayerSprite from './PlayerSprite';
import styles from '../../amongus/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import { markTaskAsCompleted } from '../service (Frontend)/WebsocketService';
import Stomp from 'stompjs';

interface Props {
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentplayer: String;
  stompClient: Stomp.Client | null;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentplayer}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState<JSX.Element | null>(null);
  const [buttonsClicked, setButtonsClicked] = useState<{ [key: string]: boolean[] }>({}); // Track which buttons are clicked for each interactible

  const handleButtonClick = (interactible: Interactible, buttonIndex: number) => {
    const interactibleId = interactible.id; // Get the interactible ID from the object
    
    // Mark the button as clicked
    setButtonsClicked(prevState => {
      const prevButtonsClicked = prevState[interactibleId] || [];
      const updatedButtonsClicked = [...prevButtonsClicked];
      updatedButtonsClicked[buttonIndex] = true;
      return { ...prevState, [interactibleId]: updatedButtonsClicked };
    });
  
    // If all buttons are clicked, send a message to the backend
    const interactibleButtonsClicked = buttonsClicked[interactibleId] || [];
    if (interactibleButtonsClicked.length === getRequiredButtonClicks(interactibleId)) {
      // Call markTaskAsCompleted function with interactibleId
      markTaskAsCompleted(stompClient, interactibleId);
    }
  };
  
  
  // Function to get the number of required button clicks based on the interactible type
  const getRequiredButtonClicks = (interactibleId: number) => {
    const interactible = interactibles.find(interactible => interactible.id === interactibleId);
    if (!interactible) return 0;
    switch (interactible.type) {
      case 'SWIPE':
        return 1;
      case 'MINE':
        return 2;
      case 'SCAN':
        return 3;
      default:
        return 0;
    }
  };


  

  // Function to render different popup content based on the interactable object
  const renderPopupContent = (interactible: Interactible) => {
    // Check the properties of the interactable object and render different content accordingly
    if (interactible.assignedPlayer === currentplayer) {
      if (interactible.type === 'SWIPE') {
        return (
          <div>
            <p>This is popup type 1!</p>
            <button onClick={() => handleButtonClick(interactible, 0)}>Button 1</button>
          </div>
        );
      } else if (interactible.type === 'MINE') {
        return (
          <div>
            <p>This is popup type 2!</p>
            {renderButtons(2, interactible)}
          </div>
        );
      } else if (interactible.type === 'SCAN') {
        return (
          <div>
            <p>This is popup type 3!</p>
            {renderButtons(3, interactible)}
          </div>
        );
      } else {
        // Default popup content if the interactible type is not recognized
        return (
          <div>
            <p>Unknown popup type!</p>
            <button onClick={() => handleButtonClick(interactible, 0)}>Close</button>
          </div>
        );
      }
    }
  };
  

  // Function to render multiple buttons based on the interactible type
  const renderButtons = (numButtons: number, interactible: Interactible) => {
    const buttons = [];
    for (let i = 0; i < numButtons; i++) {
      buttons.push(
        <button key={i} onClick={() => handleButtonClick(interactible, i)}>Button {i +1}</button>
      );
    }
    return buttons;
  };

  return (
    <div className={styles.fillContainer}>
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
