import React, { useEffect, useState } from 'react';
import styles from '../styles/EmergencyMeetingOverlay.module.css';
import ChatRoom from '../components/ChatRoom';
import MessageInput from '../components/MessageInput';
import { sendChatMessage, subscribeToMessages, subscribeToEjectedPlayer, sendVote } from '../service (Frontend)/WebsocketService';
import Stomp from 'stompjs';
import SpaceShip from './SpaceShip';
import Player from './interfaces/Player';

interface EmergencyMeetingOverlayProps {
  playerNames: string[];
  stompClient: Stomp.Client | null;
  playerName: string;
  killedPlayers: string[];
}

const EmergencyMeetingOverlay: React.FC<EmergencyMeetingOverlayProps> = ({ playerNames, stompClient, playerName, killedPlayers }) => {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [votes, setVotes] = useState<{ [key: string]: { vote: number; skip: number } }>({});
  const [ejectedPlayer, setEjectedPlayer] = useState<string | null>(null);
  const [showEjectedGif, setShowEjectedGif] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (stompClient) {
      const unsubscribeMessages = subscribeToMessages(stompClient, setMessages);
      const unsubscribeEjectedPlayer = subscribeToEjectedPlayer(stompClient, (player) => {
        setEjectedPlayer(player.name);
        setShowEjectedGif(true);
        setTimeout(() => setShowEjectedGif(false), 2500); // Adjust the duration as needed
      });
      return () => {
        unsubscribeMessages();
        unsubscribeEjectedPlayer();
      };
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

  const handleVote = (votedPlayer: string, vote: 'vote' | 'skip') => {
    if (stompClient && playerName) {
      sendVote(stompClient, playerName, votedPlayer, vote);
    }
    setHasVoted(true);
  };

  const handlePlayerEjected = (ejectedPlayer: Player) => {
    setShowEjectedGif(true);
    setTimeout(() => setShowEjectedGif(false), 2500);

  }

  const half = Math.ceil(playerNames.length / 2);
  const leftColumnNames = playerNames.slice(0, half);
  const rightColumnNames = playerNames.slice(half);

  return (
    <div className={styles.emergencyOverlay}>
      <div className={styles.playerList}>
        <h2>Player Names</h2>
        <div className={styles.columns}>
          <ul className={styles.column}>
            {leftColumnNames.map(name => (
              <li key={name} className={styles.playerName}>
                {name} {killedPlayers.includes(name) && <span>(DEAD)</span>}
                <div>
                  Vote: {votes[name]?.vote ?? 0}
                  <button onClick={() => handleVote(name, 'vote')} disabled={hasVoted}>Vote</button>
                </div>
              </li>
            ))}
          </ul>
          <ul className={styles.column}>
            {rightColumnNames.map(name => (
              <li key={name} className={styles.playerName}>
                {name} {killedPlayers.includes(name) && <span>(DEAD)</span>}
                <div>
                  Vote: {votes[name]?.vote ?? 0}
                  <button onClick={() => handleVote(name, 'vote')} disabled={hasVoted}>Vote</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.skipButtonContainer}>
          <button onClick={() => handleVote(playerName, 'skip')} disabled={hasVoted}>Skip</button>
        </div>
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
          <MessageInput sendMessage={sendMessage} chatVisible={isChatVisible} playerName={playerName} killedPlayers={killedPlayers} />
          <ChatRoom messages={messages} />
        </div>
      )}
      {showEjectedGif && (
        <div className={styles.ejectedGifContainer}>
          <img src="src/main/resources//ejected.gif" alt="Ejected" className={styles.ejectedGif} />
        </div>
      )}
    </div>
  );
};

export default EmergencyMeetingOverlay;
