import React from 'react';
import SabotageTasks from '../interfaces/SabotageTask';
import Stomp from "stompjs";

import { CSSProperties } from 'react';
import { enableSabotage } from '../../service/WebsocketService';
import SabotageMiniGame from './SabotageMiniGame';


interface Props {
    stompClient: Stomp.Client | null; // Add stompClient to props
    sabotageTasks: SabotageTasks[];
    currentPlayer: String;
    roomCode: String;
}

const SabMiniGames: React.FC<Props> = ({ stompClient, sabotageTasks, currentPlayer, roomCode }) => {
    return (
        <div style={{ position: 'fixed' }}>
            {sabotageTasks.map(sabotage => {
                if(sabotage.inProgress && sabotage.triggeredBy == currentPlayer){
                    return <div><SabotageMiniGame key={sabotage.id} stompClient={stompClient} sabotageTask={sabotage} roomCode={roomCode} /> </div>
                }
            })}
        </div>
    );
};

export default SabMiniGames;
