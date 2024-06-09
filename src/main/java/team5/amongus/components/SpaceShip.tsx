import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs';
import Task from './Task';
import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import { killPlayer, subscribeToPlayerKilled, subscribeToEmergencyMeeting, sendEmergencyMeeting } from '../service (Frontend)/WebsocketService';
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
  roomCode: string;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, currentPlayer, roomCode }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [currAlive, setCurrAlive] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);
  const [showEmergencyMeeting, setShowEmergencyMeeting] = useState(false);
  const [playerPositions, setPlayerPositions] = useState(players);

  useEffect(() => {
    const unsubscribeEmergencyMeeting = subscribeToEmergencyMeeting(stompClient, handleEmergencyMeeting, roomCode);

    return () => {
      unsubscribeEmergencyMeeting();
    };
  }, [stompClient, currentPlayer, roomCode]);

  useEffect(() => {
    if (!currentPlayer || !players) return;
    const currentPlayerObj = players[currentPlayer] as Player | undefined;
    if (currentPlayerObj) {
      if (currentPlayerObj.isAlive) {
        setCurrAlive(true);
      } else {
        setCurrAlive(false);
      }
    }
    if (currentPlayerObj && currentPlayerObj.isImposter) {
      setIsImposter(true);
    }
  }, [players, currentPlayer]);

  useEffect(() => {
    if (!stompClient) return;
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled, roomCode);
    return () => {
      unsubscribeKilled();
    };
  }, [stompClient]);

  const handlePlayerKilled = (killedPlayer: Player) => {
    console.log("Interactibles:", interactibles);
    console.log("Killed player:", killedPlayer);
    console.log("Current player:", currentPlayer);
    if (!killedPlayer || !killedPlayer.name || !currentPlayer) return;
    if (killedPlayer.name === currentPlayer) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    console.log("Adding killed player to killedPlayers:", killedPlayer.name);
    setKilledPlayers(prevKilledPlayers => {
      const newKilledPlayers = [...prevKilledPlayers, killedPlayer.name];
      console.log("KilledPlayersList:", newKilledPlayers);
      return newKilledPlayers;
  });
};

  const handleKill = () => {
    if (!stompClient || !currentPlayer || !roomCode) return;
    killPlayer(stompClient, currentPlayer, roomCode);
  };

  const handleEmergencyMeeting = () => {
    setShowEmergencyMeeting(true);
    setTimeout(() => setShowEmergencyMeeting(false), 30000); // Show overlay for 30 seconds
  };
  
  const completedTasks = interactibles.filter(interactible => interactible.hasOwnProperty('completed')).filter(interactible => interactible.completed).length;
  const totalTasks = interactibles.filter(interactible => interactible.hasOwnProperty('completed')).length;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  const mapWidth = 4000;
  const mapHeight = 2316;

  const playerX = players && players[currentPlayer] ? players[currentPlayer].position.x : 0;
  const playerY = players && players[currentPlayer] ? players[currentPlayer].position.y : 0;
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
        <div className={styles.gifBackground}></div>
        <div className={styles.spaceShipBackground}>
          {Object.values(players).map(player => (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                isMoving={player.isMoving !== undefined ? player.isMoving : false}
                isAlive={currAlive}
              />
            </div>
          ))}
          <EmergencyButton stompClient={stompClient} playerName={currentPlayer} onEmergencyMeeting={() => sendEmergencyMeeting(stompClient, currentPlayer, roomCode)} />
          <div>
            {
              interactibles
                .filter(interactible => interactible.hasOwnProperty('found')) // Filter interactibles with the "found" property
                .map(interactible => (
                  <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y+30, left: interactible.position.x+30}}>
                    {/* Render your component based on the interactible */}
                    <img src="src/main/resources/deadbodycrewmate.png" alt="Dead Player" style={{ width: '50px', height: '60px', position: 'relative' }} />
                  </div>
                ))
            }
          </div>
          <Task stompClient={stompClient} interactibles={interactibles} currentPlayer={currentPlayer} offsetX={offsetX} offsetY={offsetY} roomCode={roomCode} />
        </div>
      </div>
        {showEmergencyMeeting && (
          <EmergencyMeetingOverlay
          playerNames={playerNamesforMeeting}
          stompClient={stompClient}
          playerName={currentPlayer}
          roomCode={roomCode}
          players={players}
          />
        )}
      <ProgressBar progress={progressPercentage} />
      {showKillGif && (
        <div className={styles.killGifContainer}></div>
      )}
      {isImposter && <KillButton onKill={handleKill} />}
    </div>
  );
};

export default SpaceShip;
