import React, { useEffect, useState } from 'react';
import Player from './interfaces/Player'; // Import the Player interface
import PlayerSprite from './PlayerSprite';
import styles from '../../amongus/spaceship.module.css';
import KillButton from './KillButton';
import { killPlayer, subscribeToPlayerKilled, subscribeToImposter } from '../service (Frontend)/WebsocketService';

interface Props {
  players: Record<string, Player>;
  playerName: string;
  stompClient // Adjust the type of stompClient as per your implementation
}

const SpaceShip: React.FC<Props> = ({ players, playerName, stompClient }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);

  // Subscribe to player killed events when the component mounts
  useEffect(() => {
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled);
    const unsubscribeImposter = subscribeToImposter(stompClient, (imposterName: string) => {
      if (imposterName === playerName) {
        setIsImposter(true);
      }
    });

    return () => {
      unsubscribeKilled();
      unsubscribeImposter();
    };
  }, [stompClient, playerName]);

  // Handler for player killed event
  const handlePlayerKilled = (killedPlayer: Player) => {
    // Check if the killed player is the current player
    if (killedPlayer.name === playerName) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    setKilledPlayers(prevKilledPlayers => [...prevKilledPlayers, killedPlayer.name]);
  };

  const handleKill = () => {
    killPlayer(stompClient, playerName);
  };

  return (
    <div>
      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
        {/* Render players */}
        {Object.values(players).map(player => (
          !killedPlayers.includes(player.name) && (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              {/* Render each player's sprite */}
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                isMoving={player.isMoving !== undefined ? player.isMoving : false}
              />
            </div>
          )
        ))}
        {/* Render PNG image for killed players */}
        {killedPlayers.map(killedPlayerName => (
          <div key={killedPlayerName} style={{ position: 'absolute', top: players[killedPlayerName].position.y, left: players[killedPlayerName].position.x }}>
            {/* Render the PNG image for the killed player */}
            <img src="src\main\resources\deadbodycrewmate.png" alt="Dead Player" style={{width: '80px', height: '90px', marginTop: "25px" }} />
          </div>
        ))}
        <div>
          <KillButton onKill={handleKill} />
        </div>
        {showKillGif && (
          <div className={styles.killGifContainer}></div>
        )}
      </div>
    </div>
  );
};

export default SpaceShip;