package team5.service;

import java.util.List;

import org.springframework.stereotype.Service;

import team5.model.Message;

@Service
public class ChatService implements IChatService {

    @Override
    public List<Message> processMessage(List<Message> chatMessages, Message message) {
        String sender = message.getSender();
        String content = message.getContent();
        chatMessages.add(message);
        System.out.println("[ChatService.java] New message arrived:" + content);
        return chatMessages;
    }
    
}