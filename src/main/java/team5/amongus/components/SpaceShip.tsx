import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs';
import Task from './Task';
import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import { killPlayer, subscribeToPlayerKilled, subscribeToImposter } from '../service (Frontend)/WebsocketService';
import KillButton from './KillButton';

interface Props {
  stompClient: Stomp.Client | null;
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentPlayer: String;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentPlayer }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled);
    const unsubscribeImposter = subscribeToImposter(stompClient, (imposterName: string) => {
      if (imposterName === currentPlayer) {
        setIsImposter(true);
      }
    });

    return () => {
      unsubscribeKilled();
      unsubscribeImposter();
    };
  }, [stompClient, currentPlayer]);

  const handlePlayerKilled = (killedPlayer: Player) => {
    if (killedPlayer.name === currentPlayer) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    setKilledPlayers(prevKilledPlayers => [...prevKilledPlayers, killedPlayer.name]);
  };

  const handleKill = () => {
    killPlayer(stompClient, currentPlayer);
  };

  const completedTasks = interactibles.filter(interactible => interactible.completed).length;
  const totalTasks = interactibles.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <div className={styles.fillContainer}>
      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
        <ProgressBar progress={progressPercentage} />
        {Object.values(players).map(player => (
          !killedPlayers.includes(player.name) && (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                isMoving={player.isMoving !== undefined ? player.isMoving : false}
              />
            </div>
          )
        ))}
        {killedPlayers.map(killedPlayerName => (
          <div key={killedPlayerName} style={{ position: 'relative', top: players[killedPlayerName].position.y, left: players[killedPlayerName].position.x }}>
            <img src="src\main\resources\deadbodycrewmate.png" alt="Dead Player" style={{width: '80px', height: '90px', position: 'relative' }} />
          </div>
        ))}
        <KillButton onKill={handleKill} />
        {showKillGif && (
          <div className={styles.killGifContainer}></div>
        )}
        <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer} />
      </div>
    </div>
  );
};

export default SpaceShip;
