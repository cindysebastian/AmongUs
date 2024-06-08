package team5.amongus.service;

import team5.amongus.model.Message;
import team5.amongus.model.Player;


import java.util.List;
import org.springframework.stereotype.Service;


@Service
public class ChatService implements IChatService {

    @Override
    public List<Message> processMessage(List<Message> chatMessages, Message message) {
        Player sender = message.getSender();
        String content = message.getContent().trim();

        // Check if sender name is not empty and not "player", and content is not empty
        if (sender == null || content.isEmpty() || sender.getName().isEmpty()
                || sender.getName().equalsIgnoreCase("player")) {
            return chatMessages; // Return existing chatMessages list if message is invalid
        }

        chatMessages.add(message);

        return chatMessages; // Return updated chatMessages list
    }

    

}