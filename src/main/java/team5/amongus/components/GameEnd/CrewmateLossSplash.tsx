import React from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite';

const CrewmateLossSplash = ({ imposterName }) => (
    <div className="splash-screen crewmate-loss">
        <h1 className="loss-text">Defeat!</h1>
        <p className="loss-text">The not-dwarf has succeeded!</p>
        <p className="loss-text">The dwarfs' mission has failed! The gold under the mountain has been lost!</p>
        <p className="win-text">The not-dwarf was:</p><br /><br />
        <div className="player-sprite-wrapper">
            <PlayerSprite player={{ name: imposterName, position: { x: 0, y: 0 } }} facing="RIGHT" isMoving={false} /> {/* Render PlayerSprite */}
            
        </div>
        <button className="action-button">Attempt Anew</button>
    </div>
);

export default CrewmateLossSplash;
