import React, { useState, useEffect, ReactElement } from 'react';
import ImposterWinSplash from './ImposterWinSplash';
import CrewmateWinSplash from './CrewmateWinSplash';
import ImposterLossSplash from './ImposterLossSplash';
import CrewmateLossSplash from './CrewmateLossSplash';

interface Player {
    isImposter: boolean;
    // Add other player properties here
}

interface GameEndHandlerProps {
    stompClient: any;
    interactionInProgress: boolean;
    currentPlayer: string;
    players: { [key: string]: Player };
    gameStatus: string;
}

const GameEndHandler: React.FC<GameEndHandlerProps> = ({
    stompClient,
    interactionInProgress,
    currentPlayer,
    players,
    gameStatus
}) => {
    const [currentPlayerObj, setCurrentPlayerObj] = useState<Player | null>(null);
    const [splashScreen, setSplashScreen] = useState<ReactElement | null>(null);

    useEffect(() => {
        setCurrentPlayerObj(players[currentPlayer]);
    }, [currentPlayer, players]);

    useEffect(() => {
        if (currentPlayerObj) {
            console.log("Updating game state");
            switch (gameStatus) {
                case 'Imposter wins':
                    if (currentPlayerObj.isImposter) {
                        setSplashScreen(<ImposterWinSplash />);
                    } else {
                        setSplashScreen(<CrewmateLossSplash />);
                    }
                    break;
                case 'Crewmates win':
                    if (currentPlayerObj.isImposter) {
                        setSplashScreen(<ImposterLossSplash />);
                    } else {
                        setSplashScreen(<CrewmateWinSplash />);
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
