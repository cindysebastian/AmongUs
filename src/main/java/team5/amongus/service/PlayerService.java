// PlayerServiceImpl.java
package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Imposter;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;
import team5.amongus.model.GameManager;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;


@Service
public class PlayerService implements IPlayerService {

    private final GameManager gameManager;

    public PlayerService(GameManager gameManager) {
        this.gameManager = gameManager;
    }

    @Override
    public Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload) {
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
                        } else {
                            player.setCanKill(false);
                            break;
                        }

                    }
                }

                // TODO: Add Logic for collision with tasks here

                player.setCanInteract(canInteract);
            }

            // Broadcast updated player positions to all clients
            return playersMap;

        } catch (IOException e) {
            e.printStackTrace();
            return playersMap; // Return the current player map if an error occurs
        }
    }
    // Method to handle killing a player
    public void handleKill(String victimName) {
        Imposter imposter = gameManager.getImposters().get(0); // Assuming only one imposter for simplicity

        // Get the victim from the players map
        Player victim = gameManager.getPlayers().stream()
            .filter(player -> player.getName().equals(victimName))
            .findFirst()
            .orElse(null);

        if (imposter != null && victim != null && imposter.isImposter() && victim.isAlive()) {
            // If the imposter exists and is indeed an imposter,
            // the victim exists, and the victim is not already dead

            // Initiate the kill
            imposter.kill(victim);
            // You might want to update other game state here, like removing tasks, etc.
        }
    }

}
