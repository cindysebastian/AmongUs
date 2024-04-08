import React from 'react';

const ChatRoom = ({messages}) => {
    return (
        <div>
            {messages.map((message, index) => (
                <div key={index}>
                    <span>{message.sender}:</span>
                    <span>{message.content}</span>
                </div>
            ))}
        </div>
    );
};

export default ChatRoom;