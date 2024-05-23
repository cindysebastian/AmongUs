import React, { useState } from 'react';
import styles from '../../amongus/private.module.css';
import { setPlayer } from '../service (Frontend)/WebsocketService';

const Private = (history) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState(4);
  const [inGamePlayers, setInGamePlayers] = useState({});
  const [firstPlayerName, setFirstPlayerName] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [players, setPlayers] = useState({});
  const [playerSpawned, setPlayerSpawned] = useState(false);

  const handleSpawnPlayer = () => {
    if (Object.values(inGamePlayers as Record<string, { name: string }>).some(player => player.name === playerName.trim())) {
      alert('Player name already exists in the game. Please choose a different name.');
      return;
    }
    if (!firstPlayerName) {
      setFirstPlayerName(playerName.trim());
    }
    if (stompClient && playerName.trim() && roomCode.trim()) {
      if (Object.keys(players).length > 0) {
        alert("The game has already started. You cannot join at this time.");
        return;
      }
      setPlayer(stompClient, playerName);
      setPlayerSpawned(true);
      history.push(`/game?roomCode=${roomCode.trim()}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {!playerSpawned && (
        <div className={styles.gifBackground}></div>
      )}
      {!playerSpawned && (
        <div className={styles.loginbackground}>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', marginBottom: '13%', bottom: '0px', left: '50%', right: '50%' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className={styles.input}
            />
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter room code"
              className={styles.input}
              style={{ marginLeft: '10px' }}
            />
            <button onClick={handleSpawnPlayer} className={styles.button}>Spawn Player</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Private;
