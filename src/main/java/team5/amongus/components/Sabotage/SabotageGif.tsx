import React, { useState } from 'react';
import Stomp from "stompjs";
import SabotageTask from '../interfaces/SabotageTask';

interface Props {
    stompClient: Stomp.Client | null;
    sabotage: SabotageTask;
    roomCode: String;
}

const SabotageGif: React.FC<Props> = ({stompClient, sabotage, roomCode}) => {

    return (
        <div>
            <div>
                <video>
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}

export default SabotageGif;