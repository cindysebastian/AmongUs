import React, { useState } from 'react';
import Stomp from "stompjs";
import Sabotage from '../interfaces/Sabotage';

interface Props {
    stompClient: Stomp.Client | null;
    sabotage: Sabotage;
    roomCode: String;
}

const SabotageGif: React.FC<Props> = ({stompClient, sabotage, roomCode}) => {

    return (
        <div style={{height: "100%", width: "100%", position: "fixed"}}>
            <video>
                <source src={`src/main/resources/${sabotage.name}.gif`} type='video' />
                Your browser does not support the video tag.
            </video>
        </div>
    )
}

export default SabotageGif;