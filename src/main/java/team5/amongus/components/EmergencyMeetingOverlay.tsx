import React, { useEffect, useState } from 'react';
import styles from '../styles/EmergencyMeetingOverlay.module.css';
import ChatRoom from '../components/ChatRoom';
import MessageInput from '../components/MessageInput';
import { sendChatMessage, subscribeToMessages, subscribeToEjectedPlayer, sendVote, sendVoteTimemout } from '../service (Frontend)/WebsocketService';
import Stomp from 'stompjs';
import Player from './interfaces/Player';

interface EmergencyMeetingOverlayProps {
  playerNames: string[];
  stompClient: Stomp.Client | null;
  playerName: string;
  roomCode: string;
  players: Record<string, Player>;
}

const EmergencyMeetingOverlay: React.FC<EmergencyMeetingOverlayProps> = ({ playerNames, stompClient, playerName, roomCode, players }) => {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [votes, setVotes] = useState<{ [key: string]: { vote: number; skip: number } }>({});
  const [ejectedPlayer, setEjectedPlayer] = useState<string | null>(null);
  const [showEjectedGif, setShowEjectedGif] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30); // Initial countdown time


  useEffect(() => {
    if (stompClient) {
      const unsubscribeMessages = subscribeToMessages(stompClient, setMessages, roomCode);
      const unsubscribeEjectedPlayer = subscribeToEjectedPlayer(
        stompClient,
        roomCode,
        setEjectedPlayer,
        setShowEjectedGif // Pass setShowEjectedGif as the fourth argument
      );
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime === 5) {
            // Send a message to trigger vote submission at 25 seconds
            console.log("sendvotesubmission");
            sendVoteTimemout(stompClient, roomCode);
          }
          console.log(prevTime);
          return prevTime > 0 ? prevTime - 1 : 0;
        });
      }, 1000); // Update countdown every second
  
      return () => {
        unsubscribeMessages();
        unsubscribeEjectedPlayer();
        clearInterval(countdownInterval); // Clear interval on component unmount
      };
    }
  }, [stompClient]);

  const sendMessage = (messageContent: string) => {
    if (stompClient && players[playerName].isAlive) {
      sendChatMessage(stompClient, playerName, messageContent, roomCode);
    }
  };

  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleVote = (votedPlayer) => {
    if (stompClient && playerName) {
      console.log("voted for " + votedPlayer);
      sendVote(stompClient, playerName, votedPlayer, roomCode);
    }
    setHasVoted(true);
  };

  const half = Math.ceil(playerNames.length / 2);
  const leftColumnNames = playerNames.slice(0, half);
  const rightColumnNames = playerNames.slice(half);

  const isPlayerAlive = players[playerName]?.isAlive || false;

  return (
    <div className={styles.emergencyOverlay}>
      <div className={styles.playerList}>
        <h2>Player Names</h2>
        <div className={styles.columns}>
          <ul className={styles.column}>
            {leftColumnNames.map(name => (
              <li key={name} className={styles.playerName}>
                {name} {!players[name].isAlive && <span>(DEAD)</span>}
                {players[name].isAlive && (
                  <div>
                    Vote: {votes[name]?.vote ?? 0}
                    <img
                      src="src/main/resources/yesVote.png" // Update the path to point to your GIF file
                      alt="Vote"
                      onClick={() => handleVote(name)}
                      className={`${styles.voteButton} ${!players[name].isAlive ? styles.deadButton : ''} ${hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <ul className={styles.column}>
            {rightColumnNames.map(name => (
              <li key={name} className={styles.playerName}>
                {name} {!players[name].isAlive && <span>(DEAD)</span>}
                {players[name].isAlive && (
                  <div>
                    Votes: {votes[name]?.vote ?? 0}
                    <img
                      src="src/main/resources/yesVote.png" // Update the path to point to your GIF file
                      alt="Vote"
                      onClick={() => handleVote(name)}
                      className={`${styles.voteButton} ${!players[name].isAlive ? styles.deadButton : ''} ${hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.skipButtonContainer}>
          <img
            src="src/main/resources/skipVote.png" // Update the path to point to your PNG file
            alt="Skip"
            onClick={() => handleVote("")}
            className={`${styles.skipButton} ${hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
          />
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
          <MessageInput
            sendMessage={sendMessage}
            chatVisible={isChatVisible}
            playerName={playerName}
            players={players}
          />
          <ChatRoom messages={messages} />
        </div>
      )}
      {showEjectedGif && (
        <div className={styles.ejectedGifContainer}>
          <img src="src/main/resources/ejected.gif" alt="Ejected" className={styles.ejectedGif} />
        </div>
      )}
      <div className={styles.countdown}>
        <h2>Time Remaining: {timeRemaining-5} seconds</h2>
      </div>
    </div>
  );
};

export default EmergencyMeetingOverlay;
