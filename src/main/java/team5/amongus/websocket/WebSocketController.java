package team5.amongus.websocket;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team5.amongus.model.Player;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/setPlayer")
    @SendTo("/topic/players")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Do not add invalid player
        }

        playersMap.put(playerName, player);

        // Broadcast updated player list to all clients
        broadcastPlayerUpdate();

        return playersMap;
    }

    @MessageMapping("/move")
    @SendTo("/topic/players")
    public Map<String, Player> move(String payload) {
        System.out.println("Request Received!");
    
        try {
            final ObjectMapper objectMapper = new ObjectMapper();
    
            // Parse the JSON payload into a Map<String, Object>
            Map<String, Object> requestData = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {
            });
    
            // Extract player name and direction from the parsed data
            String playerName = (String) requestData.get("playerName");
            String direction = (String) requestData.get("direction");
    
            // Rest of your existing logic...
            if (playerName == null || playerName.isEmpty()) {
                return playersMap; // Ignore move requests without player name
            }
    
            Player existingPlayer = playersMap.get(playerName);
            if (existingPlayer == null) {
                return playersMap; // Player not found
            }
    
            // Update the player's position
            existingPlayer.handleMovementRequest(direction);
            playersMap.put(playerName, existingPlayer);
    
            // Log the updated position for debugging
            System.out.println("Updated position for player " + playerName + ": (" + existingPlayer.getPosition().getX()
                    + ", " + existingPlayer.getPosition().getY() + ")");
    
            // Broadcast updated player positions to all clients
            broadcastPlayerUpdate();
    
            return playersMap;
        } catch (IOException e) {
            e.printStackTrace();
            return playersMap; // Return the current player map if an error occurs
        }
    }
    
    // Method to broadcast updated player list to all clients
    private void broadcastPlayerUpdate() {
        messagingTemplate.convertAndSend("/topic/players", playersMap);
    }
}