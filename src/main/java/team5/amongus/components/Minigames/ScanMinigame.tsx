import React, { useState, useEffect } from 'react';
import { completeMiniGame } from "../../service (Frontend)/TaskService";
import Stomp from "stompjs";
import styles from './MiniGame.module.css'; // Import CSS module
import Task from "../interfaces/Interactible";

interface Props {
    stompClient: Stomp.Client | null;
    interactible: Task;
}

const ScanMinigame: React.FC<Props> = ({ stompClient, interactible }) => {
    const [isCompleted, setIsCompleted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const handleHoldStart = () => {
        // Start timer when holding button
        setTimer(setInterval(() => {
            setProgress(prevProgress => Math.min(prevProgress + 10, 100)); // Increment progress by 1 every second
        }, 1000));
    };

    const handleHoldEnd = () => {
        // Stop timer and check if completion condition met
        if (timer) clearInterval(timer);
        if (progress >= 100 && !isCompleted) {
            if (stompClient) {
                completeMiniGame(stompClient, interactible.id);
                setIsCompleted(true);
            }
            playSound();
        }
        setProgress(0); // Reset progress
    };

    const playSound = () => {
        const audio = new Audio('/scan_complete.mp3'); // Path relative to the public directory
        audio.volume = 1.0; // Ensure volume is set to 100%
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    };

    useEffect(() => {
        return () => {
            // Cleanup timer on component unmount
            if (timer) clearInterval(timer);
        };
    }, [timer]);

    return (
        <div className={styles.overlay}>
            <div className={styles.scanPopup}>
                <div className={styles.scanProgress} style={{ width: `${progress}%` }}></div>
                <button
                    className={styles.scanButton}
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                >
                    Hold to Scan
                </button>
            </div>
        </div>
    );
};

export default ScanMinigame;
