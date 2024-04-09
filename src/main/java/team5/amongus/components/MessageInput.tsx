import React, { useState } from 'react';

const MessageInput = ({ sendMessage, chatVisible }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', display: chatVisible ? 'flex' : 'none', alignItems: 'center' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Type your message"
        style={{ marginRight: '10px', padding: '8px 16px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }}
      />
      <button type="submit" style={{ padding: '8px 16px',  marginLeft:'15px', fontSize: '16px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Send</button>
    </form>
  );
};

export default MessageInput;
