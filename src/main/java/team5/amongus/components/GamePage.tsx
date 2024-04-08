import React from 'react';

const GamePage = ({ players, handleKeyDown }) => {
  // Attach event listener for keyboard input
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div style={{ padding: '20px' }}>
      {/* Render players */}
      {Object.keys(players).map((name) => (
        <div
          key={name}
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: 'red', // Assuming all players are red on the game page
            position: 'absolute',
            top: `${players[name].position.y}px`,
            left: `${players[name].position.x}px`,
          }}
        >
          {name}
        </div>
      ))}
    </div>
  );
};

export default GamePage;
