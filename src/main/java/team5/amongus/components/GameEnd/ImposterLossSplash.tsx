import React, { useState } from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite'; // Import PlayerSprite component

const ImposterLossSplash = ({ imposterName, onLeave, onWait }) => {
    const [waitingForHost, setWaitingForHost] = useState(false);

    const handleWait = () => {
        setWaitingForHost(true);
        onWait();
    };
    return (
        <div className="splash-screen imposter-loss">
            <h1 className="loss-text">Defeat!</h1>
            <p className="loss-text">The not-dwarf <span className="imposter-name">{imposterName}</span> has been vanquished!</p>
            <p className="loss-text">The dwarfs have prevailed!</p><br /> <br />
            <PlayerSprite player={{ 
    name: imposterName, 
    position: { x: 0, y: 0 }, 
    step: 0, 
    width: 0, 
    height: 0, 
    canInteract: false, 
    isAlive: false, 
    lastActivityTime: 0, 
    sessionId: '', 
    isHost: false, 
    isImposter: false, 
    canKill: false 
}} facing="RIGHT" isMoving={false} />
 {/* Render PlayerSprite */}
            {waitingForHost ? (
                <p className="waiting-text">Waiting for host...</p>
            ) : (
                <div className='choiceButtons'>
                    <button className="action-button" onClick={onLeave} title='Return to login screen'>Depart thy Crew</button>
                    <button className="action-button" onClick={handleWait}title='Wait for another round to start'>Wait to Join</button>
                </div>
            )}
        </div>
    );
};

export default ImposterLossSplash;
