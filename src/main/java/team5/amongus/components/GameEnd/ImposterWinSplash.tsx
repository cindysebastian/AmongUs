import React from 'react';
import './SplashScreen.css'; // Import CSS for styling
import PlayerSprite from '../PlayerSprite'; // Import PlayerSprite component

const ImposterWinSplash = ({ imposterName }) => (
    <div className="splash-screen imposter-win">
        <h1 className="win-text">Victory!</h1>
        <p className="win-text">The not-dwarf <span className="imposter-name">{imposterName}</span> has triumphed!</p>
        <p className="win-text">The dwarfs have been outwitted!</p><br /> <br />
        <PlayerSprite player={{ name: imposterName, position: {x:0,y:0} }} facing="RIGHT" isMoving={false} /> {/* Render PlayerSprite */}
        <button className="action-button">Huzzah!</button>
    </div>
);

export default ImposterWinSplash;
