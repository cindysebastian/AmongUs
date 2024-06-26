import React from 'react';
import SabotageTasks from '../interfaces/SabotageTask';
import Stomp from "stompjs";

import { CSSProperties } from 'react';
import { enableSabotage } from '../../service/WebsocketService';
import SabotageMiniGame from './SabotageMiniGame';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    sabotageTasks: SabotageTasks[];
}

const Sabotage: React.FC<Props> = ({ stompClient, sabotageTasks }) => {
    return (
        <div style={{ position: 'fixed' }}>
            {/* Render images at the coordinates of sabotage tasks */}
            {sabotageTasks.map(task => (
                (task.sabotage.inProgress &&
                <img
                    key={task.id}
                    src={`gameservice/src/main/resources/sabotage/${task.sabotage.name}Task.png`} // Assuming you have images named after interactible types
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
        </div>
    );
};

export default Sabotage;
