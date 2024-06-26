import React, { useState } from 'react';
import { completeMiniGame } from "../../service/TaskService";
import Stomp from "stompjs";
import WoodenBeamSlider from './WoodenBeamSlider';
import styles from './MiniGame.module.css'; // Import CSS module
import Task from "../interfaces/Interactible";

interface Props {
    stompClient: Stomp.Client | null;
    interactible: Task;
    roomCode: String;
}

const SwipeMinigame: React.FC<Props> = ({ stompClient, interactible, roomCode}) => {
    const [isDoorClosed, setIsDoorClosed] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleSlide = (position: number) => {
        if (position >= 0.5 && !isCompleted) {
            if (stompClient) {
                setTimeout(() => {
                    
                    completeMiniGame(stompClient, interactible.id, roomCode);
                    setIsCompleted(true);
                    // Play ding sound when completed
                }, 1500); // Adjust the delay time as needed (1500 milliseconds = 1.5 seconds)
            }
            playDingSound();
            setIsCompleted(true);
            // Play ding sound when completed
        }
    };

    const handleClick = () => {
        if (!isDoorClosed) {
            // Play sound effect only if door is not already closed
            playSound();
            setIsDoorClosed(true); // Close the door
        }
    };

    const playSound = () => {
        const audio = new Audio('/door_close.mp3'); // Path relative to the public directory
        audio.volume = 0.07; // Ensure volume is set to 100%
        audio.play().catch(error => {
            console.error('[SwipeMinigame.tsx] Error playing audio:', error);
        });
    };

    const playDingSound = () => {
        const audio = new Audio('/scan_completed.mp3'); // Path relative to the public directory
        audio.volume = 0.07; // Ensure volume is set to 100%
        audio.play().catch(error => {
            console.error('[SwipeMinigame.tsx] Error playing audio:', error);
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.swipepopup} onClick={handleClick}>
                <div className={styles.popupContent}>
                    <div>
                        {/* Display door image when door is closed */}
                        {isDoorClosed && (
                            <div>
                                <div className={styles.doorclosed}></div>
                                <WoodenBeamSlider onSlide={handleSlide} onComplete={() => setIsCompleted(true)} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SwipeMinigame;
