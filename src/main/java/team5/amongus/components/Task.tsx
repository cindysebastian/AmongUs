import React from 'react';
import Interactible from './interfaces/Interactible';
import MineMinigame from './Minigames/MineMinigame';
import Stomp from "stompjs";
import SwipeMinigame from './Minigames/SwipeMinigame';
import ScanMinigame from './Minigames/ScanMinigame';

import { CSSProperties } from 'react';
import Player from './interfaces/Player';

interface Props {
    stompClient: Stomp.Client | null;
    interactibles: Interactible[];
    currentPlayer: Player;
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
            {interactibles.filter(interactible => interactible.assignedPlayer === currentPlayer.name).map(interactible => (
                <img
                    key={interactible.id}
                    src={`src/main/resources/${interactible.type.toLowerCase()}${currentPlayer.canInteract ? 'red' : ''}.png`} // Display "red.png" if canInteract is true
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
                if (interactible.assignedPlayer === currentPlayer.name && interactible.inProgress) {
                    switch (interactible.type) {
                        case 'MINE':
                            return <div key={interactible.id} style={cameraStyle}><MineMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
                        case 'SCAN':
                            return <div key={interactible.id} style={cameraStyle}><ScanMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
                        case 'SWIPE':
                            return <div key={interactible.id} style={cameraStyle}><SwipeMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode}/></div>;
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
