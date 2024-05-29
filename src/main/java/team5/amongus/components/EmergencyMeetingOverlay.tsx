import React, { useEffect, useState } from 'react';
import styles from '../styles/EmergencyMeetingOverlay.module.css';
import ChatRoom from '../components/ChatRoom';
import MessageInput from '../components/MessageInput';
import { sendChatMessage, subscribeToMessages } from '../service (Frontend)/WebsocketService';
import Stomp from 'stompjs';

interface EmergencyMeetingOverlayProps {
  playerNames: string[];
  stompClient: Stomp.Client | null;
  playerName: string;
}

const EmergencyMeetingOverlay: React.FC<EmergencyMeetingOverlayProps> = ({ playerNames, stompClient, playerName }) => {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    if (stompClient) {
      return subscribeToMessages(stompClient, setMessages);
    }
  }, [stompClient]);

  const sendMessage = (messageContent: string) => {
    if (stompClient) {
      sendChatMessage(stompClient, playerName, messageContent);
    }
  };

  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
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
      <button onClick={handleToggleChat} className={styles.chatButton}>
        {isChatVisible ? 'Close Chat' : 'Open Chat'}
      </button>
      {isChatVisible && (
        <div className={styles.chatContainer}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ color: 'white', margin: '0' }}>Chat</h2>
          </div>
          <button className={styles.closeChatButton} onClick={handleToggleChat}>Exit</button>
          <MessageInput sendMessage={sendMessage} chatVisible={isChatVisible} />
          <ChatRoom messages={messages} />
        </div>
      )}
    </div>
  );
};

export default EmergencyMeetingOverlay;
