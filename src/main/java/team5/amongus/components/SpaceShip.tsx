import React, { useEffect, useState } from 'react';
import Stomp from 'stompjs';
import Task from './Task';
import styles from '../styles/spaceship.module.css';
import Interactible from './interfaces/Interactible';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import ProgressBar from './ProgressBar';
import { enableSabotage, killPlayer, subscribeToPlayerKilled } from '../service (Frontend)/WebsocketService';
import KillButton from './KillButton';
import Space from './Space';
import { CSSProperties } from 'react';
import SabotageTask from './interfaces/SabotageTask';
import Sabotage from './Sabotage/Sabotage';
import SabotageGif from './Sabotage/SabotageGif';

interface Props {
  stompClient: Stomp.Client | null;
  players: Record<string, Player>;
  interactibles: Interactible[];
  sabotageTasks: SabotageTask[];
  currentPlayer: string;
  roomCode: string;
}

const SpaceShip: React.FC<Props> = ({ stompClient, players, interactibles, sabotageTasks, currentPlayer, roomCode }) => {
  const [showKillGif, setShowKillGif] = useState(false);
  const [isImposter, setIsImposter] = useState(false);
  const [currAlive, setCurrAlive] = useState(false);
  const [killedPlayers, setKilledPlayers] = useState<string[]>([]);
  const [sabotageCooldown, setSabotageCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(120); // 2 minutes in seconds

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
    if (!killedPlayer || !killedPlayer.name || !currentPlayer) return;
    if (killedPlayer.name === currentPlayer) {
      setShowKillGif(true);
      setTimeout(() => setShowKillGif(false), 2500);
    }
    setKilledPlayers(prevKilledPlayers => [...prevKilledPlayers, killedPlayer.name]);
  };

  const handleKill = () => {
    if (!stompClient || !currentPlayer || !roomCode) return;
    killPlayer(stompClient, currentPlayer, roomCode);
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
  const zoomLevel = 1; // Adjust this value to control the zoom level
  const playerAdjust = 40; // half of the player width and height
  
  const offsetX = Math.max(0, Math.min(playerX + playerAdjust - (window.innerWidth / zoomLevel) / 2, mapWidth - window.innerWidth / zoomLevel));
  const offsetY = Math.max(0, Math.min(playerY + playerAdjust - (window.innerHeight / zoomLevel) / 2, mapHeight - window.innerHeight / zoomLevel));
  
  const cameraStyle: CSSProperties = {
    transform: `scale(${zoomLevel}) translate(-${offsetX}px, -${offsetY}px)`,
    transformOrigin: 'top left',
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${mapWidth}px`,
    height: `${mapHeight}px`,
  };

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
          <div>
            {interactibles
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
          <Sabotage stompClient={stompClient} sabotageTasks={sabotageTasks} currentPlayer={currentPlayer} offsetX={offsetX} offsetY={offsetY} roomCode={roomCode} />
        </div>
      </div>
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
      {isImposter && <KillButton onKill={handleKill} />}
      {isImposter && !sabotageCooldown && !sabotageTasks.some(task => task.sabotage.inProgress) &&
        <>
          <div onClick={() => handleSabotage("EndGameSabotage")} style={{ position: 'absolute', top: '50px', right: '50px', backgroundColor: 'white', zIndex: 50 }}>End Game Sabotage</div> 
          <div onClick={() => handleSabotage("AnnoySabotage")} style={{ position: 'absolute', top: '80px', right: '50px', backgroundColor: 'white', zIndex: 50 }}>Annoy Sabotage</div>
        </>
      }
      {isImposter && sabotageCooldown && <div style={{zIndex: 10, top: "10px", right: "10px", backgroundColor: 'white', position: "absolute"}}>Sabotage Cooldown: {cooldownTime} seconds</div>}
    </div>
  );
};

export default SpaceShip;
