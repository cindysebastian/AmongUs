import React from 'react';
import styles from '../../amongus/spaceship.module.css';

const KillButton = ({ onKill }) => {
  const handleKill = () => {
    // You can add confirmation logic or any other functionality here
    onKill();
  };

  return (
    <button className={styles.killButton} onClick={handleKill}>
      <img src="src/main/resources/killButtonIcon.png" alt="Kill Button" className={styles.killButtonIcon} />
    </button>
  );
};

export default KillButton;
