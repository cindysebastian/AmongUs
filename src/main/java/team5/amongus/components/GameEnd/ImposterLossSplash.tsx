import React from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite'; // Import PlayerSprite component

const ImposterLossSplash = ({ imposterName }) => (
    <div className="splash-screen imposter-loss">
        <h1 className="loss-text">Defeat!</h1>
        <p className="loss-text">The not-dwarf <span className="imposter-name">{imposterName}</span> has been vanquished!</p>
        <p className="loss-text">The dwarfs have prevailed!</p><br /> <br />
        <PlayerSprite player={{ name: imposterName, position: { x: 0, y: 0 } }} facing="RIGHT" isMoving={false} /> {/* Render PlayerSprite */}
        <button className="action-button">Attempt Anew</button>
    </div>
);

export default ImposterLossSplash;
