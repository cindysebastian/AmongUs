package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import team5.amongus.model.Message;
import team5.amongus.model.Player;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();

    @MessageMapping("/setPlayer")
    @SendTo("/topic/players")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Do not add invalid player
        }

        playersMap.put(playerName, player);
        return playersMap;
    }

    @MessageMapping("/move")
    @SendTo("/topic/players")
    public Map<String, Player> move(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Ignore invalid move requests
        }

        playersMap.put(playerName, player);
        return playersMap;
    }

    private final List<Message> chatMessages = new ArrayList<>(); // Define chatMessages list

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        Player sender = message.getSender();
        String content = message.getContent().trim();

        // Check if sender name is not empty and not "player", and content is not empty
        if (sender == null || content.isEmpty() || sender.getName().isEmpty() || sender.getName().equalsIgnoreCase("player")) {
            return new ArrayList<>(); // Return empty list if message is invalid
        }
        
        chatMessages.add(message);
        
        return chatMessages; // Return list of chatMessages
    }

}
