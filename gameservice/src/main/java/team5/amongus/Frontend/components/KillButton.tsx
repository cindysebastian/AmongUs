import React from 'react';
import styles from './../styles/spaceship.module.css';

const KillButton = ({ onKill, canKill, killCooldown, killCooldownTime }) => {
  const handleKill = () => {
    // You can add confirmation logic or any other functionality here
    if (canKill) {
      onKill();
    }
  };

  const buttonStyle = {
    opacity: canKill && !killCooldown ? 1 : 0.5,
  };

  return (
    <div
      className={styles.killButton}
      onClick={handleKill}
      style={buttonStyle}
    >
      <img
        src="gameservice/src/main/resources/killButtonIcon.png"
        alt="Kill Button"
        className={styles.killButtonIcon}
      />
      {killCooldown && (
            <div className={styles.cooldownOverlay}>
              <div className={styles.cooldownText}>{killCooldownTime}</div>
            </div>
          )}
    </div>
  );
};

export default KillButton;
