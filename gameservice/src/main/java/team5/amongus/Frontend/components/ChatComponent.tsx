import React, { useEffect, useState } from 'react';
import { connectWebSocket, sendChatMessage } from '../service/WebsocketService';
import ChatRoom from './ChatRoom';
import MessageInput from './MessageInput';

const ChatComponent = ({ playerName, roomCode }) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(true); // Control the visibility of the chat

  useEffect(() => {
    const disconnect = connectWebSocket(setStompClient);

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (stompClient) {
      const subscription = stompClient.subscribe(`/topic/messages/${roomCode}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompClient, roomCode]);

  const handleSendMessage = (messageContent) => {
    sendChatMessage(stompClient, playerName, messageContent, roomCode);
  };

  return (
    <div>
      <ChatRoom messages={messages} />
      <MessageInput sendMessage={handleSendMessage} chatVisible={chatVisible} />
    </div>
  );
};

export default ChatComponent;
