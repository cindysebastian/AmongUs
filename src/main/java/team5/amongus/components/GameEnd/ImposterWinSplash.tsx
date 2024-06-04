import React, { useState } from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite'; // Import PlayerSprite component

const ImposterWinSplash = ({ imposterName, onLeave, onWait }) => {
    const [waitingForHost, setWaitingForHost] = useState(false);

    const handleWait = () => {
        setWaitingForHost(true);
        onWait();
    };

    return (
        <div className="splash-screen imposter-win">
            <h1 className="win-text">Victory!</h1>
            <p className="win-text">The not-dwarf <span className="imposter-name">{imposterName}</span> has triumphed!</p>
            <p className="win-text">The dwarfs have been outwitted!</p><br /> <br />
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
                    <button className="action-button" onClick={onLeave}>Depart thy Crew</button>
                    <button className="action-button" onClick={handleWait}>Wait to Join</button>
                </div>
            )}
        </div>
    );
};

export default ImposterWinSplash;
