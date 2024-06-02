import React, { useState } from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite';

const CrewmateWinSplash = ({ imposterName, onLeave, onWait }) => {
    const [waitingForHost, setWaitingForHost] = useState(false);

    const handleWait = () => {
        setWaitingForHost(true);
        onWait();
    };

    return (
        <div className="splash-screen crewmate-win">
            <h1 className="win-text">Victory!</h1>
            <p className="win-text">The dwarfs have emerged victorious!</p>
            <p className="win-text">The not-dwarf has been defeated! All hail the team work of the dwarven folk!</p>
            <p className="win-text">The not-dwarf was:</p><br /><br />
            <div className="player-sprite-wrapper">
                <PlayerSprite player={{ name: imposterName, position: { x: 0, y: 0 } }} facing="RIGHT" isMoving={false} /> {/* Render PlayerSprite */}
            </div>
            {waitingForHost ? (
                <p className="waiting-text">Waiting for host...</p>
            ) : (<div>
                <button className="action-button" onClick={onLeave}>Depart thy Crew</button>
                <button className="action-button" onClick={handleWait}>Wait to Join</button>
            </div>
            )}
        </div>
    );
};

export default CrewmateWinSplash;
