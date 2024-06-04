import React, { useState, useEffect, ReactElement } from 'react';
import ImposterWinSplash from './ImposterWinSplash';
import CrewmateWinSplash from './CrewmateWinSplash';
import ImposterLossSplash from './ImposterLossSplash';
import CrewmateLossSplash from './CrewmateLossSplash';
import Player from '../interfaces/Player';
import Stomp from 'stompjs';


interface GameEndHandlerProps {
    stompClient: Stomp.Client | null;
    setInteractionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    currentPlayer: string;
    players: { [key: string]: Player };
    gameStatus: string;
    handleDisconnect: () => void;
    handleResetLobby: () => void;
    roomCode: string;
}

const GameEndHandler: React.FC<GameEndHandlerProps> = ({
    stompClient,
    setInteractionInProgress,
    currentPlayer,
    players,
    gameStatus,
    handleDisconnect,
    handleResetLobby,
    roomCode
}) => {
    const [currentPlayerObj, setCurrentPlayerObj] = useState<Player | null>(null);
    const [splashScreen, setSplashScreen] = useState<ReactElement | null>(null);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);
    const [waitingPlayersCount, setWaitingPlayersCount] = useState<number>(0);

    let isHost = false;
    useEffect(() => {
        if (players[currentPlayer]) {
            setCurrentPlayerObj(players[currentPlayer]);
            if (players[currentPlayer].isHost) {
                isHost = true;
            }
            
        }
    }, [currentPlayer, players]);


    useEffect(() => {
        // Count the total number of players
        setTotalPlayers(Object.keys(players).length);
    }, [players]);

    useEffect(() => {
        // Calculate the number of waiting players
        const waitingCount = Object.values(players).filter(player => player.willContinue).length;
        setWaitingPlayersCount(waitingCount);
    }, [players]);

    let imposterName = '';

    // Iterate through the list of players to find the imposter and check if the current player is the host
    Object.keys(players).forEach((key) => {
        const player = players[key];
        // Example condition to identify imposters
        if (player.isImposter) {
            imposterName = player.name;
        }
    });

    useEffect(() => {
        if (currentPlayerObj) {
            console.log("Updating game state");
            switch (gameStatus) {
                case 'Imposter wins':
                    setInteractionInProgress(true);
                    if (currentPlayerObj.isImposter) {
                        setSplashScreen(
                            <ImposterWinSplash
                                imposterName={imposterName}
                                onLeave={handleLeave}
                                onWait={handleWait}

                            />
                        );
                    } else {
                        setSplashScreen(
                            <CrewmateLossSplash
                                imposterName={imposterName}
                                onLeave={handleLeave}
                                onWait={handleWait}

                            />
                        );
                    }
                    break;
                case 'Crewmates win':
                    setInteractionInProgress(true);
                    if (currentPlayerObj.isImposter) {
                        setSplashScreen(
                            <ImposterLossSplash
                                imposterName={imposterName}
                                onLeave={handleLeave}
                                onWait={handleWait}

                            />
                        );
                    } else {
                        setSplashScreen(
                            <CrewmateWinSplash
                                imposterName={imposterName}
                                onLeave={handleLeave}
                                onWait={handleWait}

                            />
                        );
                    }
                    break;
                default:
                    setSplashScreen(null);
                    break;
            }
        }
    }, [gameStatus, currentPlayerObj, currentPlayer, players]);

    const handleLeave = () => {
        handleDisconnect();
    };

    const handleWait = () => {
        console.log("Player wants to wait to join the next game");
        stompClient.send(`/app/wait/${roomCode}`, {}, currentPlayer);
    };


    return (
        <div>
            {splashScreen}
            <div>
                {true && !(waitingPlayersCount == totalPlayers) && (
                    <button className="grey-button">Reset Lobby</button>
                )}
                {true /*&& waitingPlayersCount === totalPlayers*/ && (
                    <button className="action-button" onClick={handleResetLobby}>Reset Lobby</button>
                )}
            </div>
            <div className='text'>
                {/* Display the number of connected players */}
                <p>{waitingPlayersCount}/{totalPlayers} player(s) waiting...</p>
            </div>
        </div>
    );
};
export default GameEndHandler;
