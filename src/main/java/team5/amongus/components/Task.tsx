// Task.tsx

import React from 'react';
import Interactible from './interfaces/Interactible';
import MineMinigame from './Minigames/MineMinigame';
import Stomp from "stompjs";
import SwipeMinigame from './Minigames/SwipeMinigame';
import ScanMinigame from './Minigames/ScanMinigame';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    interactibles: Interactible[];
    currentPlayer: String;
    roomCode: String;

}

const Task: React.FC<Props> = ({ stompClient, interactibles, currentPlayer, roomCode}) => {
    return (
        <div>
            {/* Render images at the coordinates of interactibles */}
            {interactibles.map(interactible => (
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
                    }}
                />
            ))}
            {/* Render minigame components for each interactible */}
            {interactibles.map(interactible => {
                // Check if the player assigned to the task is the current player and if the task is in progress

                if (interactible.assignedPlayer == currentPlayer && interactible.inProgress) {
                    switch (interactible.type) {
                        case 'MINE':
                            return <MineMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/>;
                        case 'SCAN':
                            return <ScanMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/>;
                        case 'SWIPE':
                            return <SwipeMinigame key={interactible.id} stompClient={stompClient} interactible={interactible} roomCode={roomCode}/>;
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
