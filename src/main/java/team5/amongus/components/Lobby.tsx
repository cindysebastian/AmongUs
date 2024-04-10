import React, { useEffect, useState } from 'react';
import Player from './interfaces/Player';
import PlayerSprite from './PlayerSprite';
import bgImage from '../../../../resources/LobbyBG.png';
import Space from './Space';

interface Props {
  players: Record<string, Player>;
}


interface PlayerComponentProps {
  player: Player;
}


const Lobby: React.FC<Props> = ({ players }) => {
  return (
    <div style={{ position: 'relative' }}>
      {/* Render Background */}
      <div
        className="map-background"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          zIndex: -1,
          backgroundPosition: 'center',
        }}
      ></div>
      <Space />

      {/* Render players */}
      {Object.values(players).map(player => (
        <div key={player.name} style={{ position: 'absolute', top: player.position.y, left: player.position.x }}>
          <PlayerSprite
            key={player.name}
            facing={player.facing !== undefined ? player.facing : 'RIGHT'}
            ismoving={player.ismoving !== undefined ? player.ismoving : false}
          />
        </div>
      ))}

    </div>
  );
};


export default Lobby;