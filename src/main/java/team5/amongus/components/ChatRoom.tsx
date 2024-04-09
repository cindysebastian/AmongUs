import React from 'react';

const ChatRoom = ({messages}) => {
    return (
        <div>
            {messages.slice(0).reverse().map((message, index) => (
                <div key={index} style={{color: 'white'}}>
                    <span>{message.sender}: </span>
                    <span>{message.content}</span>
                </div>
            ))}
        </div>
    );
};

export default ChatRoom;