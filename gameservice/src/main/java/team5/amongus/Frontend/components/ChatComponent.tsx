import React, { useEffect, useState } from 'react';
import { connectWebSocket, sendChatMessage } from '../service/WebsocketService';
import ChatRoom from './ChatRoom';
import MessageInput from './MessageInput';

const ChatComponent = ({ playerName, roomCode }) => {
  const [stompClient, setStompClient] = useState(null);
  const [stompChatClient, setStompChatClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(true); // Control the visibility of the chat

  useEffect(() => {
    const disconnect = connectWebSocket(setStompClient, setStompChatClient);

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (stompChatClient) {
      const subscription = stompChatClient.subscribe(`/topic/messages/${roomCode}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompChatClient, roomCode]);

  const handleSendMessage = (messageContent) => {
    sendChatMessage(stompChatClient, playerName, messageContent, roomCode);
  };

  return (
    <div>
      <ChatRoom messages={messages} />
      <MessageInput sendMessage={handleSendMessage} chatVisible={chatVisible} playerName={''} players={undefined}/>
    </div>
  );
};

export default ChatComponent;
