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
    <form onSubmit={handleSubmit}>
      {chatVisible && ( // Render input field only if chatVisible is true
        <>
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Type your message"
          />
          <button type="submit">Send</button>
        </>
      )}
    </form>
  );
};

export default MessageInput;
