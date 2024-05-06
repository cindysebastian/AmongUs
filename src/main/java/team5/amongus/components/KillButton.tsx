import React from 'react';

const KillButton = ({ onKill }) => {
  const handleKill = () => {
    // You can add confirmation logic or any other functionality here
    onKill();
  };

  return (
    <button onClick={handleKill}>Kill</button>
  );
};

export default KillButton;