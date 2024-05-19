import React, { useState, useEffect } from 'react';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import Space from './Space';
import styles from '../../amongus/lobby.module.css';
import LobbyBG_withTransparentGround from '../../../../resources/LobbyBG_borders.png';
import DebugCollisionMask from '../../../../resources/debug_collision_mask.png'; // Path to your debug collision mask image

interface Props {
  inGamePlayers: Record<string, Player>;
  firstPlayerName: string;
  onStartButtonClick: () => void;
}

const Lobby: React.FC<Props> = ({ inGamePlayers, firstPlayerName, onStartButtonClick }) => {
  const [playerCount, setPlayerCount] = useState(Object.keys(inGamePlayers).length);
  const [isStartButtonClicked, setIsStartButtonClicked] = useState(false);
  const [collisionMask, setCollisionMask] = useState<Uint8Array | null>(null);

  useEffect(() => {
    setPlayerCount(Object.keys(inGamePlayers).length);
  }, [inGamePlayers]);

  const isFirstPlayer = firstPlayerName === Object.keys(inGamePlayers)[0];

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      const imageData = context.getImageData(0, 0, image.width, image.height);
      const mask = createCollisionMask(imageData);
      setCollisionMask(mask);
    };
    image.src = LobbyBG_withTransparentGround;
  }, []);

  const createCollisionMask = (imageData: ImageData): Uint8Array => {
    const { width, height, data } = imageData;
    const mask = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      const pixelIndex = i / 4;
      mask[pixelIndex] = alpha > 5 ? 1 : 0;
    }

    return mask;
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.lobbyBackground}></div>
      <Space />

      <div className={styles.playerCountContainer}>
        <img src="src/main/resources/playerCountIcon.png" alt="Among Us Icon" className={styles.playerCountIcon} />
        <div className={styles.playerCount}>{playerCount}</div>
        {isFirstPlayer && (
          <div className={styles.startButtonContainer} onClick={onStartButtonClick}>
            <img
              src="src/main/resources/startButtonIcon.png"
              alt="Start Button Icon"
              className={`${styles.startButtonIcon} ${isStartButtonClicked ? styles.clicked : ''}`}
            />
          </div>
        )}
      </div>

      {Object.values(inGamePlayers).map(player => {
        const isMoving = player.isMoving !== undefined ? player.isMoving : false;
        console.log(`Player ${player.name} isMoving:`, isMoving);
        return (
          <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
            <PlayerSprite
              player={player}
              facing={player.facing !== undefined ? player.facing : 'RIGHT'}
              isMoving={isMoving}
            />
          </div>
        );
      })}

      {/* Overlay the debug collision mask */}
      <img src={DebugCollisionMask} className={styles.collisionMask} alt="Debug Collision Mask" />
    </div>
  );
};

export default Lobby;
