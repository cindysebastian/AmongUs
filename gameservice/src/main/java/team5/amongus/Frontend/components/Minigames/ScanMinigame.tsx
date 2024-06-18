import React, { useState, useEffect } from 'react';
import { completeMiniGame } from "../../service/TaskService";
import Stomp from "stompjs";
import styles from './MiniGame.module.css'; // Import CSS module
import Task from "../interfaces/Interactible";


interface Props {
    stompClient: Stomp.Client | null;
    interactible: Task;
    roomCode: String;
}

const ScanMinigame: React.FC<Props> = ({ stompClient, interactible, roomCode }) => {
    const [isCompleted, setIsCompleted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [isSoundPlaying, setIsSoundPlaying] = useState(false);
    const [sound, setSound] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isSoundPlaying && !isCompleted) {
            // Start sound when holding button
            playContinuousSound();
        } else if (!isSoundPlaying && sound) {
            // Pause sound if not holding button or task is completed
            sound.pause();
        }
        return () => {
            // Cleanup sound on component unmount
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        };
    }, [isSoundPlaying, isCompleted]);

    const handleHoldStart = () => {
        // Start timer when holding button
        setTimer(setInterval(() => {
            setProgress(prevProgress => {
                const newProgress = Math.min(prevProgress + 10, 100); // Increment progress by 10% every second
                if (newProgress >= 100 && !isCompleted) {
                    if (stompClient) {
                        completeMiniGame(stompClient, interactible.id, roomCode);
                        setIsCompleted(true);

                    }
                    setIsSoundPlaying(false); // Stop continuous sound when task completed
                    playSound(); // Play sound when completion reached
                }
                return newProgress;
            });
        }, 1000));

        // Start sound 30 seconds in when holding button
        setIsSoundPlaying(true);
    };

    const handleHoldEnd = () => {
        // Stop timer when releasing button
        if (timer) clearInterval(timer);
        setProgress(0); // Reset progress
        setIsSoundPlaying(false); // Stop sound when releasing button
    };

    const playContinuousSound = () => {
        const audio = new Audio('/hobbitstoisengard.mp3'); // Path relative to the public directory
        audio.volume = 0.5; // Adjust volume as needed
        audio.loop = true; // Make the sound loop continuously
        audio.currentTime = 30; // Start 30 seconds in
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
        setSound(audio);
    };

    const playSound = () => {
        const audio = new Audio('/scan_completed.mp3'); // Path relative to the public directory
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
                <video className={styles.scanBackgroundVideo} autoPlay loop muted>
                    <source src="/hobbitstoisengard.mp4" type="video/mp4" />
                    {/* Add additional source elements for different video formats if needed */}
                    Your browser does not support the video tag.
                </video>
                <div className={styles.scanProgress} style={{ width: `${progress}%` }}></div>
                <button
                    className={styles.scanButton}
                    onMouseDown={handleHoldStart}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                >
                    Sound the Horn!
                </button>
                <div className={styles.scanForegroundImage}></div>
            </div>
        </div>
    );
};

export default ScanMinigame;
