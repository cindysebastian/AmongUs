import React, { useEffect, useState, CSSProperties, useRef } from 'react';
import Stomp from 'stompjs';
import TaskIcons from './TaskIcons';
import TaskMiniGames from './TaskMiniGames';
import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import { enableSabotage, killPlayer, subscribeToPlayerKilled } from '../service/WebsocketService';
import KillButton from './KillButton';
import EmergencyMeetingOverlay from './EmergencyMeetingOverlay';
import Space from './Space';
import SabotageTask from './interfaces/SabotageTask';
import Sabotage from './Sabotage/Sabotage';
import SabotageGif from './Sabotage/SabotageGif';
import Arrow from './Arrow';
import SabotageArrow from './SabotageArrow';
import RoleAnimation from './RoleAnimation';
import backgroundMusic from '../../../../../resources/nazgul.mp3';

interface Props {
  stompClient: Stomp.Client | null;
  players: Record<string, Player>;
  interactibles: Interactible[];
  sabotageTasks: SabotageTask[];
  currentPlayer: string;
  roomCode: string;
  setInteractionInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, sabotageTasks, currentPlayer, roomCode, setInteractionInProgress }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [currAlive, setCurrAlive] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);
  const [killCooldown, setKillCooldown] = useState(false);
  const [playerPositions, setPlayerPositions] = useState(players);

  const [sabotageCooldown, setSabotageCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(120); // 2 minutes in seconds
  const [showAnimation, setShowAnimation] = useState(true);

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

    if (showAnimation) {
      setInteractionInProgress(true);
    } else {
      setInteractionInProgress(false);
    }
  }, [players, currentPlayer, setInteractionInProgress, showAnimation]);

  useEffect(() => {
    if (!stompClient) return;
    const unsubscribeKilled = subscribeToPlayerKilled(stompClient, handlePlayerKilled, roomCode);
    return () => {
      unsubscribeKilled();
    };
  }, [stompClient]);

  const handlePlayerKilled = (killedPlayer: Player) => {
    console.log("[SpaceShip.tsx] Interactibles:", interactibles);
    console.log("[SpaceShip.tsx] Killed player:", killedPlayer);
    console.log("[SpaceShip.tsx] Current player:", currentPlayer);
    if (!killedPlayer || !killedPlayer.name || !currentPlayer) return;
    if (killedPlayer.name === currentPlayer) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    console.log("[SpaceShip.tsx] Adding killed player to killedPlayers:", killedPlayer.name);
    setKilledPlayers(prevKilledPlayers => {
      const newKilledPlayers = [...prevKilledPlayers, killedPlayer.name];
      console.log("[SpaceShip.tsx] KilledPlayersList:", newKilledPlayers);
      return newKilledPlayers;
    });
  };

  const handleKill = () => {
    if (!stompClient || !currentPlayer || !roomCode) return;
    killPlayer(stompClient, currentPlayer, roomCode);
    setKillCooldown(true);
    setTimeout(() => setKillCooldown(false), 30000);
  };

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout;
    // Function to handle cooldown reset
    const resetCooldown = () => {
      setCooldownTime(120); // Reset cooldown time to 2 minutes
      setSabotageCooldown(false); // Reset the sabotage cooldown
    };
    // Check if the cooldown is active and start the timer
    if (sabotageCooldown) {
      cooldownTimer = setTimeout(resetCooldown, cooldownTime * 1000);
    }
    // Cleanup function to clear the timer if the component unmounts or cooldown is reset
    return () => {
      clearTimeout(cooldownTimer);
    };
  }, [sabotageCooldown]); // Run this effect whenever sabotageCooldown changes

  // Function to handle sabotage button click
  const handleSabotage = (sabotageType: string) => {
    if (!stompClient || !currentPlayer || !roomCode || sabotageCooldown) return;
    // Activate the sabotage
    enableSabotage(stompClient, sabotageType, roomCode);
    // Set sabotage cooldown
    setSabotageCooldown(true);
  };

  useEffect(() => {
    let countdown: NodeJS.Timeout | null = null;
    if (sabotageCooldown) {
      countdown = setInterval(() => {
        setCooldownTime(prevTime => {
          if (prevTime === 0) {
            clearInterval(countdown);
            setSabotageCooldown(false);
            return cooldownTime;
          } else {
            return prevTime - 1;
          }
        });
      }, 1000); // Update every second

    }
    return () => {
      if (countdown) clearInterval(countdown);
    };
  }, [sabotageCooldown]);

  const completedTasks = interactibles.filter(interactible => interactible.hasOwnProperty('completed')).filter(interactible => interactible.completed).length;
  const totalTasks = interactibles.filter(interactible => interactible.hasOwnProperty('completed')).length;
  const progressPercentage = (completedTasks / totalTasks) * 100;
  const mapWidth = 4000;
  const mapHeight = 2316;

  const playerX = players && players[currentPlayer] ? players[currentPlayer].position.x : 0;
  const playerY = players && players[currentPlayer] ? players[currentPlayer].position.y : 0;
  const zoomLevel = 1.5; // Adjust this value to control the zoom level
  const playerAdjust = 40; // half of the player width and height

  const offsetX = Math.max(0, Math.min(playerX + playerAdjust - (window.innerWidth / zoomLevel) / 2, mapWidth - window.innerWidth / zoomLevel));
  const offsetY = Math.max(0, Math.min(playerY + playerAdjust - (window.innerHeight / zoomLevel) / 2, mapHeight - window.innerHeight / zoomLevel));

  const offsetXWithoutZoom = Math.max(0, Math.min(playerX + playerAdjust - (window.innerWidth) / 2, mapWidth - window.innerWidth));
  const offsetYWithoutZoom = Math.max(0, Math.min(playerY + playerAdjust - (window.innerHeight) / 2, mapHeight - window.innerHeight));

  const cameraStyle: CSSProperties = {
    transform: `scale(${zoomLevel}) translate(-${offsetX}px, -${offsetY}px)`,
    transformOrigin: 'top left',
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${mapWidth}px`,
    height: `${mapHeight}px`,
  };

  const playerNames = Object.keys(players);
  const playerNamesforMeeting = Object.values(players).map(player => player.name);

  const handleAnimationEnd = () => {
    setShowAnimation(false);
    setInteractionInProgress(false);
  };

  const calculateArrowData = (playerX: number, playerY: number, taskX: number, taskY: number) => {
    const dx = taskX - playerX;
    const dy = taskY - playerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Distance between player and task
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Set the arrow at a fixed distance from the player
    const arrowDistance = 100; // Adjust as necessary
    const x = playerX + (dx / distance) * arrowDistance + 40;
    const y = playerY + (dy / distance) * arrowDistance + 40;

    return { x, y, angle };
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05;
    }
    console.log(interactibles.find(i => i.id === 60));
  }, []);

  return (
    <div>
      <Space />
      <audio ref={audioRef} src={backgroundMusic} autoPlay loop />
      {showAnimation && (
        <RoleAnimation isImposter={isImposter} player={players[currentPlayer]} onAnimationEnd={handleAnimationEnd} />
      )}
      <div style={cameraStyle}>
        <div className={styles.gifBackground}></div>
        <div className={styles.spaceShipBackground}>
          {Object.values(players).map(player => (
            <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
              <PlayerSprite
                player={player}
                facing={player.facing !== undefined ? player.facing : 'RIGHT'}
                ismoving={player.isMoving !== undefined ? player.isMoving : false}
                isAlive={currAlive}
              />
            </div>
          ))}
          <div>
            {interactibles
              .filter(interactible => interactible.hasOwnProperty('inMeeting')) // Filter interactibles with the "inMeeting" property
              .map(interactible => (
                <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y + 80, left: interactible.position.x + 104, opacity: interactible.isCooldownActive ? 0.5 : 1}}>
                  <img src="gameservice/src/main/resources/bell.png" alt="Emergency bell" style={{ width: '80px', height: '80px', position: 'relative' }} />
                </div>
              ))
            }
            <div>
              {interactibles
                .filter(interactible => interactible.hasOwnProperty('found')) // Filter interactibles with the "found" property
                .map(interactible => (
                  <div key={interactible.id} style={{ position: 'absolute', top: interactible.position.y + 30, left: interactible.position.x + 30 }}>
                    <img src="gameservice/src/main/resources/deadbodycrewmate.png" alt="Dead Player" style={{ width: '50px', height: '60px', position: 'relative' }} />
                  </div>
                ))
              }
              <TaskIcons interactibles={interactibles} currentPlayer={players[currentPlayer]} />      
              <Sabotage stompClient={stompClient} sabotageTasks={sabotageTasks} currentPlayer={currentPlayer} offsetX={offsetXWithoutZoom} offsetY={offsetYWithoutZoom} roomCode={roomCode} />

              {interactibles
                .filter(task => task.assignedPlayer === currentPlayer).filter(task => !task.completed) // Filter tasks by assigned player
                .map(task => {
                  const { x: taskX, y: taskY } = task.position;
                  const { x, y, angle } = calculateArrowData(playerX, playerY, taskX, taskY);
                  return <Arrow key={task.id} x={x} y={y} angle={angle} />;
                })}
              {/* Arrows for Sabotage */}
              {sabotageTasks.filter(task => !task.completed).map(task => {
                if (task.sabotage.inProgress) {
                  const { x: taskX, y: taskY } = task.position;
                  const { x, y, angle } = calculateArrowData(playerX, playerY, taskX, taskY);
                  return <SabotageArrow key={task.id} x={x} y={y} angle={angle} />;
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
      <div>
        {interactibles.some(interactible => interactible.inMeeting) && (
          <EmergencyMeetingOverlay
            playerNames={playerNamesforMeeting}
            stompClient={stompClient}
            playerName={currentPlayer}
            roomCode={roomCode}
            players={players}
            interactible={interactibles.find(i => i.id === 60)}
          />
        )}
      </div>
      <TaskMiniGames 
        stompClient={stompClient} 
        interactibles={interactibles} 
        currentPlayer={players[currentPlayer]}
        roomCode={roomCode} 
      />      
      <ProgressBar progress={progressPercentage} />
      {showKillGif && (
        <div className={styles.killGifContainer}></div>
      )}
      {sabotageTasks.map(task => (
        (!isImposter && task.sabotage.inProgress) && (
          <>
            <SabotageGif key={task.id} stompClient={stompClient} sabotage={task.sabotage} roomCode={roomCode} />
          </>
        )
      ))}

      {isImposter && !killCooldown && <KillButton onKill={handleKill} canKill={players[currentPlayer].canKill} />}
      {isImposter && (
        <>
          <div onClick={() => handleSabotage("EndGameSabotage")} className={styles.lethalSabotage} style={{ opacity: !sabotageCooldown ? 1 : 0.5 }}>
            <img src="gameservice/src/main/resources/LethalSabotage.png" alt="Lethal Sabotage" className={styles.sabotageIcon} />
            {isImposter && sabotageCooldown && (
              <div className={styles.cooldownOverlay}>
                <div className={styles.cooldownText}>{cooldownTime}</div>
              </div>
            )}
          </div>
          <div onClick={() => handleSabotage("AnnoySabotage")} className={styles.sabotage} style={{ opacity: !sabotageCooldown ? 1 : 0.5 }}>
            <img src="gameservice/src/main/resources/Sabotage.png" alt="Sabotage" className={styles.sabotageIcon} />
            {isImposter && sabotageCooldown && (
              <div className={styles.cooldownOverlay}>
                <div className={styles.cooldownText}>{cooldownTime}</div>
              </div>
            )}
          </div>
        </>
      )}


    </div>
  );

};

export default SpaceShip;
