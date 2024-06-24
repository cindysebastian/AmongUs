import React, { useState } from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite';

const CrewmateLossSplash = ({ imposterName, onLeave, onWait }) => {
    const [waitingForHost, setWaitingForHost] = useState(false);

    const handleWait = () => {
        setWaitingForHost(true);
        onWait();
    };

    return (
    <div className="splash-screen crewmate-loss">
        <h1 className="loss-text">Defeat!</h1>
        <p className="loss-text">The not-dwarf has succeeded!</p>
        <p className="loss-text">The dwarfs' mission has failed! The gold under the mountain has been lost!</p>
        <p className="win-text">The not-dwarf was:</p><br /><br />
        <div className="player-sprite-wrapper">
        <PlayerSprite player={{
                    name: imposterName,
                    position: { x: 0, y: 0 },
                    step: 0,
                    width: 0,
                    height: 0,
                    canInteract: false,
                    isAlive: true,
                    lastActivityTime: 0,
                    sessionId: '',
                    isHost: false,
                    isImposter: false,
                    canKill: false
                }} facing="RIGHT" ismoving={false} isAlive={true} />
 {/* Render PlayerSprite */}
            
        </div>
        {waitingForHost ? (
                <p className="waiting-text">Waiting for host...</p>
            ) : (
                <div className='choiceButtons'>
                    <button className="action-button" onClick={onLeave}title='Return to login screen'>Depart thy Crew</button>
                    <button className="action-button" onClick={handleWait}title='Wait for another round to start'>Wait to Join</button>
                </div>
            )}
        </div>
    );
};

export default CrewmateLossSplash;
