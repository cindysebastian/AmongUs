import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import imposterVideo from '../../../../resources/Imposter.mp4';
import crewmateVideo from '../../../../resources/Crewmate.mp4';
import roleSound from '../../../../resources/shh.wav'; // Use the same sound for both roles
import styles from '../styles/RoleAnimation.module.css';

const RoleAnimation = ({ isImposter, onAnimationEnd }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const sound = new Audio(roleSound);
    sound.play();

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.play();
      videoElement.onended = () => {
        onAnimationEnd();
      };
    }

    return () => {
      sound.pause();
      sound.currentTime = 0;
      if (videoElement) {
        videoElement.onended = null;
      }
    };
  }, [onAnimationEnd]);

  return (
    <div className={styles.animationContainer}>
      <video ref={videoRef} className={styles.video} src={isImposter ? imposterVideo : crewmateVideo} />
    </div>
  );
};

RoleAnimation.propTypes = {
  isImposter: PropTypes.bool.isRequired,
  onAnimationEnd: PropTypes.func.isRequired,
};

export default RoleAnimation;
