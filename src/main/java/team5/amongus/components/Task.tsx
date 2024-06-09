// Task.tsx

import React from 'react';
import Interactible from './interfaces/Interactible';
import MineMinigame from './Minigames/MineMinigame';
import Stomp from "stompjs";
import SwipeMinigame from './Minigames/SwipeMinigame';
import ScanMinigame from './Minigames/ScanMinigame';

import { CSSProperties } from 'react';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    interactibles: Interactible[];
    currentPlayer: String;
    roomCode: String;
    offsetX: number;
    offsetY: number;
}

const Task: React.FC<Props> = ({ stompClient, interactibles, currentPlayer, offsetX, offsetY, roomCode }) => {


    const cameraStyle: CSSProperties = {
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10, // Ensure the popup is on top
    };

    return (
        <div style={{ position: 'fixed' }}>
            {/* Render images at the coordinates of interactibles */}
            {interactibles.filter(interactible => interactible.assignedPlayer).map(interactible => (
                <img
                    key={interactible.id}
                    src={`src/main/resources/${interactible.type.toLowerCase()}.png`} // Assuming you have images named after interactible types
                    alt={interactible.type}
                    style={{
                        position: 'absolute',
                        top: interactible.position.y,
                        left: interactible.position.x,
                        width: '150px', // Adjust the width as needed
                        height: '150px', // Adjust the height as needed
                        zIndex: 6,
                    }}
                />
            ))}
            {/* Render minigame components for each interactible */}
            {interactibles.map(interactible => {
                // Check if the player assigned to the task is the current player and if the task is in progress

                if (interactible.assignedPlayer == currentPlayer && interactible.inProgress) {
                    switch (interactible.type) {
                        case 'MINE':
                            return <div style={cameraStyle}><MineMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
                        case 'SCAN':
                            return <div style={cameraStyle}><ScanMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
                        case 'SWIPE':
                            return <div style={cameraStyle}><SwipeMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
                        default:
                            return null;
                    }
                } else {
                    return null;
                }
            })}
        </div>
    );
};

export default Task;
