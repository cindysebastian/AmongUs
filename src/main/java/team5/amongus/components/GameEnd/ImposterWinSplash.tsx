import React from 'react';
import './SplashScreen.css'; // Import CSS for styling

const ImposterWinSplash = () => (
    <div className="splash-screen imposter-win">
        <h1 className="win-text">Victory!</h1>
        <p className="win-text">The Imposters have won!</p>
        <p className="win-text">You, as an Imposter, played a key role in this victory.</p>
        <img src="/path/to/your/image.png" alt="Victory" className="center-image" />
        <button className="action-button">Continue</button>
    </div>
);

export default ImposterWinSplash;
