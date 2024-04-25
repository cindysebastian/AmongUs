package team5.amongus.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;

import team5.amongus.model.Message;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;
import team5.amongus.model.Task;

import java.io.IOException;
import java.util.ArrayList;
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

    private final Map<String, Long> lastHeartbeatTimestamps = new HashMap<>();

    @MessageMapping("/heartbeat")
    public void heartbeat(String playerName) {
        // Update last heartbeat timestamp for the player
        lastHeartbeatTimestamps.put(playerName, System.currentTimeMillis());
    }

    // Method to check and set isMoving to false for inactive players
    @Scheduled(fixedDelay = 10) // Check every 10 seconds
    public void checkPlayerActivity() {
        long currentTime = System.currentTimeMillis();
        for (Map.Entry<String, Long> entry : lastHeartbeatTimestamps.entrySet()) {
            String playerName = entry.getKey();
            long lastHeartbeatTime = entry.getValue();
            if (currentTime - lastHeartbeatTime > 10000) { // If more than 10 seconds have passed since last heartbeat
                Player player = playersMap.get(playerName);
                if (player != null && player.getIsMoving()) {
                    player.setIsMoving(false);
                    playersMap.put(playerName, player);
                    broadcastPlayerUpdate();
                }
            }
        }
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
            List<String> directions = moveRequest.getDirections();

            // Rest of your existing logic...
            if (playerName == null || playerName.isEmpty() || directions == null) {
                return playersMap; // Ignore move requests without player name or directions
            }

            Player existingPlayer = playersMap.get(playerName);
            if (existingPlayer == null) {
                return playersMap; // Player not found
            }

            // Update the player's position for each direction
            if (directions.isEmpty()) {
                // If there are no directions, set isMoving to false
                existingPlayer.setIsMoving(false);
            } else {
                // If there are directions, handle the movement
                for (String direction : directions) {
                    existingPlayer.handleMovementRequest(direction);
                }
                existingPlayer.setIsMoving(true);
            }
            playersMap.put(playerName, existingPlayer);

            // Calculate canKill and canInteract for each player
            for (Player player : playersMap.values()) {
                
                boolean canInteract = false;
                

                // Check collision with other players
                for (Player otherPlayer : playersMap.values()) {
                    if (!player.getName().equals(otherPlayer.getName())) {
                        if (player.collidesWith(otherPlayer)) {
                            player.setCanKill(true);
                            break;
                        }else{
                            player.setCanKill(false);
                            break;
                        }
                        
                    }
                }
                System.out.println(player.getCanKill());
                /*
                 * // Check collision with tasks
                 * for (Task task : tasksList) {
                 * if (player.collidesWith(task)) {
                 * canInteract = true;
                 * break;
                 * }
                 * }
                 */

               
                player.setCanInteract(canInteract);
            }

            // Broadcast updated player positions to all clients
            broadcastPlayerUpdate();

            return playersMap;
        } catch (IOException e) {
            e.printStackTrace();
            return playersMap; // Return the current player map if an error occurs
        }
    }

    private final List<Message> chatMessages = new ArrayList<>(); // Define chatMessages list

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        Player sender = message.getSender();
        String content = message.getContent().trim();

        // Check if sender name is not empty and not "player", and content is not empty
        if (sender == null || content.isEmpty() || sender.getName().isEmpty()
                || sender.getName().equalsIgnoreCase("player")) {
            return new ArrayList<>(); // Return empty list if message is invalid
        }

        chatMessages.add(message);

        return chatMessages; // Return list of chatMessages
    }

    // Method to broadcast updated player list to all clients
    private void broadcastPlayerUpdate() {
        messagingTemplate.convertAndSend("/topic/players", playersMap);
    }
}
