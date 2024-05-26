import React from 'react';
import './SplashScreen.css'; // Import CSS for styling

const CrewmateLossSplash = () => (
    <div className="splash-screen crewmate-loss">
        <h1 className="loss-text">Defeat!</h1>
        <p className="loss-text">The Imposters have won this time.</p>
        <p className="loss-text">Keep an eye out next time, Crewmate.</p>
        <img src="/path/to/your/image.png" alt="Defeat" className="center-image" />
        <button className="action-button">Retry</button>
    </div>
);

export default CrewmateLossSplash;
