import React, { useState } from 'react';
import Player from './interfaces/Player';

interface MessageInputProps {
  sendMessage: (message: string) => void;
  chatVisible: boolean;
  playerName: string;
  players: Record<string, Player>;
}

const MessageInput: React.FC<MessageInputProps> = ({ sendMessage, chatVisible, playerName, players }) => {
  const [inputValue, setInputValue] = useState('');

  const isPlayerAlive = players[playerName]?.isAlive || false; // Check if the player is alive

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '' && isPlayerAlive) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', display: chatVisible ? 'flex' : 'none', alignItems: 'center' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={isPlayerAlive ? "Type your message..." : "You are dead and cannot chat"}
        style={{ marginRight: '10px', padding: '8px 16px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', flex: '1', fontFamily: 'Lucida Console'}}
        disabled={!isPlayerAlive}
      />
      <button type="submit" style={{ padding: '8px 16px',  marginLeft:'15px', fontSize: '16px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Lucida Console'}} disabled={!isPlayerAlive}>Send</button>
    </form>
  );
};

export default MessageInput;
