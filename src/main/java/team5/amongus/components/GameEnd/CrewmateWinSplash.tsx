import React from 'react';
import './SplashScreen.css'; // Import CSS for styling

const CrewmateWinSplash = () => (
    <div className="splash-screen crewmate-win">
        <h1 className="win-text">Victory!</h1>
        <p className="win-text">The Crewmates have won!</p>
        <p className="win-text">Well done on your teamwork and deduction skills!</p>
        <img src="/path/to/your/image.png" alt="Victory" className="center-image" />
        <button className="action-button">Continue</button>
    </div>
);

export default CrewmateWinSplash;
