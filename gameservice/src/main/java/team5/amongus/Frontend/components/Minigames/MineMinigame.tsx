import React, { useState } from 'react';
import Task from '../interfaces/Interactible';
import { completeMiniGame } from "../../service/TaskService";
import Stomp from "stompjs";
import styles from './MiniGame.module.css'; // Import CSS module

interface Props {
  stompClient: Stomp.Client | null;
  interactible: Task;
  roomCode: String;
}

const MineMinigame: React.FC<Props> = ({ stompClient, interactible, roomCode }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false); // State to control animation

  const handleClick = () => {
    setClickCount(prevCount => prevCount + 1);
    setIsShaking(true); // Trigger animation on click
    playSound(); // Play existing sound effect
     // Play ding sound effect
    if (clickCount === 4) {
      // Call completeMiniGame function with stompClient
      playDingSound();
      completeMiniGame(stompClient, interactible.id, roomCode);
    }
  };

  const handleAnimationEnd = () => {
    setIsShaking(false); // Reset animation state after animation ends
  };

  const playSound = () => {
    const audio = new Audio('/mining.mp3'); // Path relative to the public directory
    const intervals = [0.08, 1.35, 2.8, 4.3]; // Array of specific times
    const randomTime = intervals[Math.floor(Math.random() * intervals.length)]; // Pick a random time from the array
    audio.currentTime = randomTime; // Set the playback position to the random time
    audio.volume = 0.07; // Ensure volume is set to 100%
    audio.play().then(() => {
      
      // Stop the audio after 3 seconds
      setTimeout(() => {
        audio.pause();
      }, 900);
    }).catch(error => {
      console.error('[MineMinigame.tsx] ' + error);
    });
  };
  
  const playDingSound = () => {
    const audio = new Audio('/scan_completed.mp3'); // Path relative to the public directory
    audio.volume = 0.07; // Ensure volume is set to 100%
    audio.play().catch(error => {
      console.error('[MineMinigame.tsx] Error playing audio:', error);
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.popupContent}>
          <div className={styles.imageWrapper}>
            <img
              src="gameservice/src/main/resources/mine.png"
              alt="TaskMine"
              onClick={handleClick}
              className={`${styles.mineInteract} ${isShaking ? styles.shake : ''}`}
              onAnimationEnd={handleAnimationEnd}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MineMinigame;