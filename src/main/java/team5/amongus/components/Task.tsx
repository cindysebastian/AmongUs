// Task.tsx

import React from 'react';
import  Interactible  from './interfaces/Interactible';
import styles from '../../amongus/spaceship.module.css';
import { handleButtonClick, getRequiredButtonClicks } from '../service (Frontend)/TaskService';
import Stomp from 'stompjs';

interface Props {
    interactible: Interactible;
    currentplayer: string;
    stompClient: Stomp.Client | null;
    interactibles: Interactible[];
  }
  
  const Task: React.FC<Props> = ({ interactible, currentplayer, stompClient, interactibles }) => {
    const handleButton = (buttonIndex: number) => {
      handleButtonClick(stompClient, interactible.id, buttonIndex, interactibles);
    };
  
    const renderButtons = () => {
      const numButtons = getRequiredButtonClicks(interactible.id, interactibles);
      const buttons = [];
      for (let i = 0; i < numButtons; i++) {
        buttons.push(
          <button key={i} onClick={() => handleButton(i)}>Button {i + 1}</button>
        );
      }
      return buttons;
    };
  
    return (
      <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y, left: interactible.position.x, zIndex: 1 }}>
        <div className={styles.interactible} style={{ width: interactible.width, height: interactible.height, backgroundColor: 'pink' }}>
          {/* Check if the interactible is in progress and show the popup */}
          {interactible.inProgress && !interactible.completed && (
            <div className={styles.popup}>
              <div className={styles.popupContent}>
                {renderButtons()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default Task;


