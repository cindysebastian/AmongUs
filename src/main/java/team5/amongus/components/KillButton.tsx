import React from 'react';
import styles from './../styles/spaceship.module.css';

const KillButton = ({ onKill, canKill }) => {
  const handleKill = () => {
    // You can add confirmation logic or any other functionality here
    if (canKill) {
      onKill();
    }
  };

  const buttonStyle = {
    opacity: canKill ? 1 : 0.5,
  };

  return (
    <button
      className={styles.killButton}
      onClick={handleKill}
      style={buttonStyle}
    >
      <img
        src="src/main/resources/killButtonIcon.png"
        alt="Kill Button"
        className={styles.killButtonIcon}
      />
    </button>
  );
};

export default KillButton;
