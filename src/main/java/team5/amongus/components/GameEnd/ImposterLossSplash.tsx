import React from 'react';
import './SplashScreen.css'; // Import CSS for styling

const ImposterLossSplash = () => (
    <div className="splash-screen imposter-loss">
        <h1 className="loss-text">Defeat!</h1>
        <p className="loss-text">The Crewmates have won this time.</p>
        <p className="loss-text">Better luck next time, Imposter.</p>
        <img src="/path/to/your/image.png" alt="Defeat" className="center-image" />
        <button className="action-button">Retry</button>
    </div>
);

export default ImposterLossSplash;
