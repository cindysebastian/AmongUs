// MineMinigame.tsx

import React, { useState } from 'react';
import Task from '../interfaces/Interactible';
import {completeMiniGame} from "../../service (Frontend)/TaskService"
import Stomp from "stompjs"


interface Props {
  stompClient: Stomp.Client | null; // Add stompClient to props
  interactible: Task;
}

const MineMinigame: React.FC<Props> = ({ stompClient, interactible }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount(prevCount => prevCount + 1);
    if (clickCount === 4) {
      // Call handleButtonClick function with stompClient
      completeMiniGame(stompClient, interactible.id);
    }
  };

  return (
    <div className="mine-minigame">
      {/* Your MineMinigame UI */}
      <img src="/path/to/image.png" alt="Mine" onClick={handleClick} />
    </div>
  );
};

export default MineMinigame;
