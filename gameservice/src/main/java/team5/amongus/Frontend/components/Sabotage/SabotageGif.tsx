import React, { useRef, useEffect } from 'react';
import Stomp from 'stompjs';
import Sabotage from '../interfaces/Sabotage';
import styles from './Sabotage.module.css';

interface Props {
  stompClient: Stomp.Client | null;
  sabotage: Sabotage;
  roomCode: String;
}

const SabotageGif: React.FC<Props> = ({ stompClient, sabotage, roomCode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.05;
    }

    if (audioRef.current) {
      audioRef.current.volume = 0.05;
    }
  }, []);

  return (
    <div className={styles.sabotage}>
      {sabotage.name === "EndGameSabotage" ? (
        <video ref={videoRef} className={styles.balrogBackgroundVideo} autoPlay loop>
          <source src="gameservice/src/main/resources/sabotage/EndGameSabotage.mp4" type='video/mp4' />
        </video>
      ) : (
        <>
          <img
            src={`gameservice/src/main/resources/sabotage/${sabotage.name}.gif`}
            alt={`${sabotage.name} gif`}
            style={{ height: "100%", width: "100%", position: "fixed", zIndex: 6, pointerEvents: 'none' }}
          />
          <audio ref={audioRef} controls autoPlay loop>
            <source src="gameservice/src/main/resources/sabotage/CreepyDragonRoar.wav" type="audio/wav" />
          </audio>
        </>
      )}
    </div>
  );
};

export default SabotageGif;