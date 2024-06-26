import React from 'react';
import Interactible from './interfaces/Interactible';
import MineMinigame from './Minigames/MineMinigame';
import Stomp from "stompjs";
import SwipeMinigame from './Minigames/SwipeMinigame';
import ScanMinigame from './Minigames/ScanMinigame';
import Player from './interfaces/Player';

interface Props {
    stompClient: Stomp.Client | null;
    interactibles: Interactible[];
    currentPlayer: Player;
    roomCode: String;
}

const TaskMinigames: React.FC<Props> = ({ stompClient, interactibles, currentPlayer, roomCode }) => {

    return (
        <div style={{ position: 'fixed' }}>
            {interactibles.map(interactible => {
                if (interactible.assignedPlayer === currentPlayer.name && interactible.inProgress) {
                    switch (interactible.type) {
                        case 'MINE':
                            return <div key={interactible.id}><MineMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode} /></div>;
                        case 'SCAN':
                            return <div key={interactible.id}><ScanMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode} /></div>;
                        case 'SWIPE':
                            return <div key={interactible.id}><SwipeMinigame stompClient={stompClient} interactible={interactible} roomCode={roomCode} /></div>;
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

export default TaskMinigames;