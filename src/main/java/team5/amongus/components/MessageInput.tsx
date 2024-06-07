import React, { useState } from 'react';

const MessageInput = ({ sendMessage, chatVisible, playerName, killedPlayers }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '' && !killedPlayers.includes(playerName)) { // Ensure dead players cannot send
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // Check if the current player is in the list of killed players
  const isPlayerAlive = !killedPlayers.includes(playerName);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', display: chatVisible ? 'flex' : 'none', alignItems: 'center' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={isPlayerAlive ? "Type your message..." : "You are dead and cannot chat"}
        style={{ marginRight: '10px', padding: '8px 16px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', flex: '1', fontFamily: 'Lucida Console'}}
        disabled={!isPlayerAlive} // Disable input if the player is dead
      />
      <button type="submit" style={{ padding: '8px 16px',  marginLeft:'15px', fontSize: '16px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Lucida Console'}} disabled={!isPlayerAlive}>Send</button>
    </form>
  );
};

export default MessageInput;
