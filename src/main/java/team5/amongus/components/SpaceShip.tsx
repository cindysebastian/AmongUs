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

  useEffect(() => {
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled);
    const unsubscribeImposter = subscribeToImposter(stompClient, (imposterName: string) => {
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

  const completedTasks = interactibles.filter(interactible => interactible.completed).length;
  const totalTasks = interactibles.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  const handleEmergencyMeeting = () => {
    setShowEmergencyMeeting(true); // Set state to show emergency meeting overlay
    
    // Automatically close the overlay after 30 seconds
    setTimeout(() => {
      setShowEmergencyMeeting(false);
    }, 10000); // 30 seconds in milliseconds
  };

  const playerNames = Object.values(players).map(player => player.name);

  return (
    <div className={styles.fillContainer}>
      {showEmergencyMeeting &&  (
        <EmergencyMeetingOverlay
        playerNames={playerNames}
        killedPlayers={killedPlayers}
        stompClient={stompClient}
        playerName={currentPlayer}
      />
      )}
      <div className={styles.gifBackground}></div>
      <div className={styles.spaceShipBackground}>
        <ProgressBar progress={progressPercentage} />
        {Object.values(players).map(player => (
          !killedPlayers.includes(player.name) && (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              <PlayerSprite
                player={player}
                facing={player.facing ?? 'RIGHT'}
                isMoving={player.isMoving ?? false}
              />
            </div>
          )
        ))}
        {killedPlayers.map(killedPlayerName => (
          <div key={killedPlayerName} style={{ position: 'relative', top: players[killedPlayerName].position.y, left: players[killedPlayerName].position.x, transform: 'scale(0.4)' }}>
            <img src="src/main/resources/deadbodycrewmate.png" alt="Dead Player" className={styles.deadPlayer} />
          </div>
        ))}
        {isImposter && <KillButton onKill={handleKill} />}
        {showKillGif && (
          <div className={styles.killGifContainer}></div>
        )}
        <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer} />
        <EmergencyButton stompClient={stompClient} playerName={currentPlayer} onEmergencyMeeting={() => sendEmergencyMeeting(stompClient, currentPlayer)} />
      </div>
    </div>
  );

};

export default SpaceShip;
