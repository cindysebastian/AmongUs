package team5.amongus.websocket;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
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
        try {
            final ObjectMapper objectMapper = new ObjectMapper();
            
            // Parse the JSON payload into a PlayerMoveRequest object
            PlayerMoveRequest moveRequest = objectMapper.readValue(payload, PlayerMoveRequest.class);
    
            String playerName = moveRequest.getPlayerName();
            List<String> directions = moveRequest.getDirections(); // Change to get directions array
            
            // Rest of your existing logic...
            if (playerName == null || playerName.isEmpty() || directions == null || directions.isEmpty()) {
                return playersMap; // Ignore move requests without player name or directions
            }
    
            Player existingPlayer = playersMap.get(playerName);
            if (existingPlayer == null) {
                return playersMap; // Player not found
            }
    
            // Update the player's position for each direction
            for (String direction : directions) {
                existingPlayer.handleMovementRequest(direction);
                existingPlayer.setIsMoving(true);
            }
    
            playersMap.put(playerName, existingPlayer);
    
    
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