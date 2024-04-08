// Lobby.tsx
import React from 'react';
import Player from './interfaces/Player'; // Assuming the path to the Player interface
import PlayerSprite from './PlayerSprite'

interface Props {
  players: Record<string, Player>;
}

const Lobby: React.FC<Props> = ({ players }) => {
  return (
    <div style={{ position: 'relative' }}>
      {/* Render players */}
      {Object.values(players).map(player => (
        <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
          {/* Render PlayerSprite component */}
          <PlayerSprite />
          {player.name}
        </div>
      ))}
    </div>
  );
};

export default Lobby;
