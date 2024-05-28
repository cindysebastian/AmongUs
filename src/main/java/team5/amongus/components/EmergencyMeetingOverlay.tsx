import React, { useState } from 'react';
import styles from '../styles/EmergencyMeetingOverlay.module.css';
import ChatRoom from '../components/ChatRoom';
import MessageInput from '../components/MessageInput';
import { sendChatMessage, subscribeToMessages } from '../service (Frontend)/WebsocketService';

interface EmergencyMeetingOverlayProps {
  //toggleChat: () => void;
  //chatVisible: boolean;
  playerNames: string[];
}

const EmergencyMeetingOverlay: React.FC<EmergencyMeetingOverlayProps> = ({playerNames }) => {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);

  // Function to handle toggling chat visibility
  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
    //toggleChat(); // Call toggleChat function to handle other logic if needed
  };

  return (
    <div className={styles.emergencyOverlay}>
      <div className={styles.playerList}>
        <h2>Player Names</h2>
        <ul>
          {playerNames.map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
      {isChatVisible && (
        <div className={styles.chatContainer}>
          <ChatRoom messages={messages} />
        </div>
      )}
      <button onClick={handleToggleChat} className={styles.chatButton}>
        {isChatVisible ? 'Close Chat' : 'Open Chat'}
      </button>
    </div>
  );
};

export default EmergencyMeetingOverlay;
