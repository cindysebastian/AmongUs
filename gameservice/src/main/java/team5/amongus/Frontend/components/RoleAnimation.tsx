import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import imposterVideo from '../../../../../resources/Imposter.mp4';
import crewmateVideo from '../../../../../resources/Crewmate.mp4';
import roleSound from '../../../../../resources/shh.wav'; // Use the same sound for both roles
import styles from '../styles/RoleAnimation.module.css';
import PlayerSprite from './PlayerSprite';

const RoleAnimation = ({ isImposter, player, onAnimationEnd }) => {
  const videoRef = useRef(null);
  const [showSprite, setShowSprite] = useState(false);

  useEffect(() => {
    const sound = new Audio(roleSound);
    sound.volume = 0.07;
    sound.play();

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play();
      videoElement.volume = 0.07;
      videoElement.onended = () => {
        onAnimationEnd();
      };
    }

    const spriteTimer = setTimeout(() => {
      setShowSprite(true);
    }, 3000); // Show the sprite after 3 seconds

    const hideSpriteTimer = setTimeout(() => {
      setShowSprite(false);
    }, 8000); // Hide the sprite after 8 seconds

    return () => {
      sound.pause();
      sound.currentTime = 0;
      if (videoElement) {
        videoElement.pause();
        videoElement.onended = null;
      }
      clearTimeout(spriteTimer);
      clearTimeout(hideSpriteTimer);
    };
  }, [onAnimationEnd]);

  return (
    <div className={styles.animationContainer}>
      <video ref={videoRef} className={styles.video} src={isImposter ? imposterVideo : crewmateVideo} />
      {showSprite && (
        <div className={styles.playerSpriteWrapper}>
          <PlayerSprite player={player} facing="RIGHT" ismoving={false} isAlive={true} />
        </div>
      )}
    </div>
  );
};

RoleAnimation.propTypes = {
  isImposter: PropTypes.bool.isRequired,
  player: PropTypes.object.isRequired,
  onAnimationEnd: PropTypes.func.isRequired,
};

export default RoleAnimation;
