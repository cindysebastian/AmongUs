import React from 'react';
import styles from './../styles/spaceship.module.css';

const KillButton = ({ onKill, canKill, killCooldown, killCooldownTime }) => {
  const handleKill = () => {
    // You can add confirmation logic or any other functionality here
    if (canKill&&!killCooldown) {
      onKill();
    }
  };

  const buttonStyle = {
    opacity: canKill && !killCooldown ? 1 : 0.5,
    PointerEvent: canKill && !killCooldown ? 'auto' : 'none',
    cursor: canKill && !killCooldown ? 'pointer' : 'not-allowed',
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
