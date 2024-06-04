// Task.tsx

import React from 'react';
import Sabotage from './interfaces/SabotageTask';
import MineMinigame from './Minigames/MineMinigame';
import Stomp from "stompjs";
import SwipeMinigame from './Minigames/SwipeMinigame';
import ScanMinigame from './Minigames/ScanMinigame';

import { CSSProperties } from 'react';
import { enableSabotage } from '../service (Frontend)/WebsocketService';
import SabotageMiniGame from './Minigames/SabotageMiniGame';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    sabotages: Sabotage[];
    currentPlayer: String;
    offsetX: number;
    offsetY: number;
    roomCode: String;
}



const Task: React.FC<Props> = ({ stompClient, sabotages, currentPlayer, offsetX, offsetY, roomCode }) => {
    const cameraStyle: CSSProperties = {
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10 // Ensure the popup is on top
    };
    
    return (
        <div style={{ position: 'fixed' }}>
            {/* Render images at the coordinates of sabotage tasks */}
            {sabotages.map(sabotage => (
                <img
                    key={sabotage.id}
                    src={`src/main/resources/EndGameSabotage.png`} // Assuming you have images named after interactible types
                    alt={"Sabotage: "+ sabotage.id}
                    style={{
                        position: 'absolute',
                        top: sabotage.position.y,
                        left: sabotage.position.x,
                        width: '150px', // Adjust the width as needed
                        height: '150px', // Adjust the height as neededa
                        zIndex: 6,
                    }}
                />
            ))}
            {sabotages.map(sabotage => {
                if(sabotage.inProgress && currentPlayer){
                    return <div style={cameraStyle}><SabotageMiniGame key={sabotage.id} stompClient={stompClient} sabotageTask={sabotage} roomCode={roomCode} /> </div>
                }
            })}
        </div>
    );
};

export default Task;
