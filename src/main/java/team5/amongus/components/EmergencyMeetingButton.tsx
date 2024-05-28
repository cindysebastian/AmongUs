// EmergencyButton component
import React from 'react';
import Stomp from 'stompjs';

interface EmergencyButtonProps {
  stompClient: Stomp.Client;
  playerName: string;
  onEmergencyMeeting: () => void;
}

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ stompClient, playerName, onEmergencyMeeting }) => {
  const handleButtonClick = () => {
    if (stompClient && playerName) {
      stompClient.send('/app/emergencyMeeting', {}, playerName);
      onEmergencyMeeting(); // Notify the parent component to show the overlay
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      style={{
        position: 'absolute',
        top: '550px',
        left: '2175px',
        padding: '10px 20px',
        fontSize: '10px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        zIndex: 1000,
      }}
    >
      EMEEEEEERGENCYYYYY
    </button>
  );
};

export default EmergencyButton;
