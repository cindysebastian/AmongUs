import React from 'react';
import SabotageTasks from '../interfaces/SabotageTask';
import Stomp from "stompjs";

import { CSSProperties } from 'react';
import { enableSabotage } from '../../service (Frontend)/WebsocketService';
import SabotageMiniGame from './SabotageMiniGame';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    sabotageTasks: SabotageTasks[];
    currentPlayer: String;
    offsetX: number;
    offsetY: number;
    roomCode: String;
}

const Sabotage: React.FC<Props> = ({ stompClient, sabotageTasks, currentPlayer, offsetX, offsetY, roomCode }) => {
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
            {sabotageTasks.map(task => (
                (task.sabotage.inProgress &&
                <img
                    key={task.id}
                    src={`src/main/resources/sabotage/${task.sabotage.name}Task.png`} // Assuming you have images named after interactible types
                    alt={"Sabotage: "+ task.sabotage.name}
                    style={{
                        position: 'absolute',
                        top: task.position.y,
                        left: task.position.x,
                        width: '100px', // Adjust the width as needed
                        height: '100px', // Adjust the height as neededa
                        zIndex: 6,
                    }}
                />
                
            )))}
            {sabotageTasks.map(sabotage => {
                if(sabotage.inProgress && sabotage.triggeredBy == currentPlayer){
                    return <div style={cameraStyle}><SabotageMiniGame key={sabotage.id} stompClient={stompClient} sabotageTask={sabotage} roomCode={roomCode} /> </div>
                }
            })}
        </div>
    );
};

export default Sabotage;
