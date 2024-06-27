import React, { useEffect, useState } from 'react';
import styles from '../styles/EmergencyMeetingOverlay.module.css';
import ChatRoom from '../components/ChatRoom';
import MessageInput from '../components/MessageInput';
import { sendChatMessage, subscribeToMessages, sendVote } from '../service/WebsocketService';
import Stomp from 'stompjs';
import Player from './interfaces/Player';
import Interactible from './interfaces/Interactible';
import iVotedImg from '../../../../../resources/iVoted.png';
import yesVoteImg from '../../../../../resources/yesVote.png';
import skipVoteImg from '../../../../../resources/skipVote.png';
import ejectedGif from '../../../../../resources/ejected.gif';
import noEjectedGif from '../../../../../resources/noEjected.gif';

interface EmergencyMeetingOverlayProps {
  playerNames: string[];
  stompClient: Stomp.Client | null;
  playerName: string;
  roomCode: string;
  players: Record<string, Player>;
  interactible: Interactible;
  stompChatClient: Stomp.Client | null;
}

const EmergencyMeetingOverlay: React.FC<EmergencyMeetingOverlayProps> = ({ playerNames, stompClient, playerName, roomCode, players, interactible, stompChatClient }) => {
  const [messages, setMessages] = useState([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [state, setState] = useState({ ejectedPlayer: null as string | null, showEjectedGif: false });
  const [timeRemaining, setTimeRemaining] = useState(30); // Initial countdown time

  useEffect(() => {
    if (stompChatClient) {
      const unsubscribeMessages = subscribeToMessages(stompChatClient, setMessages, roomCode);
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime > 0 ? prevTime - 1 : 0);
      }, 1000);

      return () => {
        unsubscribeMessages();
        clearInterval(countdownInterval);
      };
    }
  }, [stompChatClient, roomCode]);

  useEffect(() => {


    if (interactible) {
      setState(prevState => ({
        ...prevState,
        ejectedPlayer: interactible.ejectedPlayer ? interactible.ejectedPlayer.name : null,
        showEjectedGif: interactible.finalising,
      }));

    }
  }, [interactible]);

  const sendMessage = (messageContent: string) => {
    if (stompChatClient && players[playerName].isAlive) {
      sendChatMessage(stompChatClient, playerName, messageContent, roomCode);
    }
  };

  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleVote = (votedPlayer: string) => {
    if (stompClient && playerName) {
      console.log("[EmergencyMeetingOverlay.tsx] voted for " + votedPlayer);
      sendVote(stompClient, playerName, votedPlayer, roomCode);
    }
  };

  const half = Math.ceil(playerNames.length / 2);
  const leftColumnNames = playerNames.slice(0, half);
  const rightColumnNames = playerNames.slice(half);

  const isPlayerAlive = players[playerName]?.isAlive || false;

  return (
    <div className={styles.emergencyOverlay}>
      <div className={styles.emergencydiv}>
        <div className={styles.playerList}>
          <h2>Discuss and Vote!</h2>
          <div className={styles.columns}>
            <ul className={styles.column}>
              {leftColumnNames.map(name => (
                <li key={name} className={styles.playerName}>
                  {name} {!players[name].isAlive && <span>(DEAD)</span>}
                  {players[name].isAlive && (
                    <div>
                      {players[name].hasVoted && (
                        <img src={iVotedImg} alt="I Voted" />
                      )}
                      <img
                        src={yesVoteImg}
                        alt="Vote"
                        onClick={() => handleVote(name)}
                        className={`${styles.voteButton} ${!players[name].isAlive ? styles.deadButton : ''} ${players[playerName].hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
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
                      {players[name].hasVoted && (
                        <img src={iVotedImg} alt="I Voted" />
                      )}
                      <img
                        src={yesVoteImg}
                        alt="Vote"
                        onClick={() => handleVote(name)}
                        className={`${styles.voteButton} ${!players[name].isAlive ? styles.deadButton : ''} ${players[playerName].hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.skipButtonContainer}>
            <img
              src={skipVoteImg}
              alt="Skip"
              onClick={() => handleVote("")}
              className={`${styles.skipButton} ${players[playerName].hasVoted || !isPlayerAlive ? styles.disabled : ''}`}
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
        {state.showEjectedGif && state.ejectedPlayer != null && (
          <div className={styles.ejectedGifContainer}>
            <p className={styles.ejectedText}>{state.ejectedPlayer} has been ejected.</p>
            <img src={ejectedGif} alt="Ejected" className={styles.ejectedGif} />
          </div>
        )}

        {state.showEjectedGif && state.ejectedPlayer === null && (
          <div className={styles.ejectedGifContainer}>
            <img src={noEjectedGif} alt="Noone Ejected" className={styles.ejectedGif} />
          </div>
        )}
        <div className={styles.countdown}>
          <h2>Time Remaining: {timeRemaining} seconds</h2>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMeetingOverlay;
