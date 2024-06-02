import React, { useState, useEffect, ReactElement } from 'react';
import ImposterWinSplash from './ImposterWinSplash';
import CrewmateWinSplash from './CrewmateWinSplash';
import ImposterLossSplash from './ImposterLossSplash';
import CrewmateLossSplash from './CrewmateLossSplash';

interface Player {
    isImposter: boolean;
    name: string,
    // Add other player properties here
}

interface GameEndHandlerProps {
    stompClient: any;
    setInteractionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
    currentPlayer: string;
    players: { [key: string]: Player };
    gameStatus: string;
}

const GameEndHandler: React.FC<GameEndHandlerProps> = ({
    stompClient,
    setInteractionInProgress,
    currentPlayer,
    players,
    gameStatus
}) => {
    const [currentPlayerObj, setCurrentPlayerObj] = useState<Player | null>(null);
    const [splashScreen, setSplashScreen] = useState<ReactElement | null>(null);

    useEffect(() => {
        setCurrentPlayerObj(players[currentPlayer]);
    }, [currentPlayer, players]);

    let imposterName = '';

    // Iterate through the list of players to find the imposter

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
                        setSplashScreen(<ImposterWinSplash imposterName={imposterName} />);
                    } else {
                        setSplashScreen(<CrewmateLossSplash imposterName={imposterName} />);
                    }
                    break;
                case 'Crewmates win':
                    setInteractionInProgress(true);
                    if (currentPlayerObj.isImposter) {
                        setSplashScreen(<ImposterLossSplash imposterName={imposterName}/>);
                    } else {
                        setSplashScreen(<CrewmateWinSplash imposterName={imposterName}/>);
                    }
                    break;
                default:
                    setSplashScreen(null);
                    break;
            }
        }
    }, [gameStatus, currentPlayerObj]);

    return <div>{splashScreen}</div>;
};

export default GameEndHandler;
