import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs';
import Task from './Task';
import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import { killPlayer, subscribeToPlayerKilled, subscribeToImposter, subscribeToEmergencyMeeting, sendEmergencyMeeting } from '../service (Frontend)/WebsocketService';
import KillButton from './KillButton';
import EmergencyButton from './EmergencyMeetingButton';
import EmergencyMeetingOverlay from './EmergencyMeetingOverlay';
import Space from './Space';
import { CSSProperties } from 'react';

interface Props {
  stompClient: Stomp.Client | null;
  players: Record<string, Player>;
  interactibles: Interactible[];
  currentPlayer: string;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentPlayer }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);
  const [showEmergencyMeeting, setShowEmergencyMeeting] = useState(false);
  const [playerPositions, setPlayerPositions] = useState(players);

  useEffect(() => {
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled);
    const unsubscribeImposter = subscribeToImposter(stompClient, (imposterName: string) => {
      // handle imposter subscription if necessary
    });
    const unsubscribeEmergencyMeeting = subscribeToEmergencyMeeting(stompClient, handleEmergencyMeeting);

    return () => {
      unsubscribeKilled();
      unsubscribeImposter();
      unsubscribeEmergencyMeeting();
    };
  }, [stompClient, currentPlayer]);

  useEffect(() => {
    if (currentPlayer && players[currentPlayer]) {
      const currentPlayerObj = players[currentPlayer] as Player;
      setIsImposter(currentPlayerObj.isImposter === true);
    }
  }, [players, currentPlayer]);

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

  const handleEmergencyMeeting = () => {
    setShowEmergencyMeeting(true);
    setTimeout(() => setShowEmergencyMeeting(false), 30000); // Show overlay for 30 seconds
  };

  const completedTasks = interactibles.filter(interactible => interactible.completed).length;
  const totalTasks = interactibles.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  const mapWidth = 4000;
  const mapHeight = 2316;

  const playerX = players[currentPlayer].position.x;
  const playerY = players[currentPlayer].position.y;
  const offsetX = Math.max(0, Math.min(playerX - window.innerWidth / 2, mapWidth - window.innerWidth));
  const offsetY = Math.max(0, Math.min(playerY - window.innerHeight / 2, mapHeight - window.innerHeight));

  const cameraStyle: CSSProperties = {
    transform: `translate(-${offsetX}px, -${offsetY}px)`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  const playerNames = Object.keys(players);
  const playerNamesforMeeting = Object.values(players).map(player => player.name);
  return (
    <div>
      <Space />
      <div style={cameraStyle}>
        {showEmergencyMeeting && (
          <EmergencyMeetingOverlay
            playerNames={playerNamesforMeeting}
            killedPlayers={killedPlayers}
            stompClient={stompClient}
            playerName={currentPlayer}
          />
        )}
        <div className={styles.gifBackground}></div>
        <div className={styles.spaceShipBackground}>
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
            <div key={killedPlayerName} style={{ position: 'absolute', top: players[killedPlayerName].position.y, left: players[killedPlayerName].position.x }}>
              <img src="src/main/resources/deadbodycrewmate.png" alt="Dead Player" style={{ width: '50px', height: '60px', position: 'relative' }} />
            </div>
          ))}
          <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer} offsetX={offsetX} offsetY={offsetY} />
          <EmergencyButton stompClient={stompClient} playerName={currentPlayer} onEmergencyMeeting={() => sendEmergencyMeeting(stompClient, currentPlayer)} />
        </div>
      </div>
      <ProgressBar progress={progressPercentage} />
      {showKillGif && (
        <div className={styles.killGifContainer}></div>
      )}
      {isImposter && <KillButton onKill={handleKill} />}
    </div>
  );
};

export default SpaceShip;
