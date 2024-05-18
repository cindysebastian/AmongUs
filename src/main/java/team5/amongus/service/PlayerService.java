// PlayerServiceImpl.java
package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Imposter;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;
import team5.amongus.model.Position;
import team5.amongus.model.GameManager;

import java.io.IOException;
import java.util.Collections;
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
                            if (player instanceof Imposter) {
                                // TODO: make kill button visible
                            }
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

    public Map<String, Player> handleKill(Player imposter, Map<String, Player> playersMap) {
        System.out.println("Trying to kill...");
        if (imposter != null && playersMap != null) {
            // Find the closest player to the player initiating the kill
            List<Imposter> imposters = gameManager.getImposters();
            Imposter currentPlayer = null;
            for (Imposter imp : imposters) {
                if (imp.getName().equals(imposter.getName())) {
                    currentPlayer = imp;
                }
            }

            if (currentPlayer != null && currentPlayer instanceof Imposter) {
                Imposter currentImposter = (Imposter) currentPlayer; // Cast currentPlayer to Imposter
                Player collidingPlayer = null;
                // Iterate through other players to find the closest one
                for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                    String name = entry.getKey();
                    Player player = entry.getValue();
                    if (!name.equals(imposter.getName()) && !(player instanceof Imposter)) { // Exclude the player
                                                                                             // initiating
                        if (currentImposter.collidesWith(player)) {
                        collidingPlayer = player;
                        break;
                    }
                    }
                }

                if (collidingPlayer != null) {
                    System.out.println("Killing " + collidingPlayer.getName());
                    currentImposter.kill(collidingPlayer);
                    Position newPosition = new Position(collidingPlayer.getPosition().getX(), collidingPlayer.getPosition().getY());
                    imposter.setPosition(newPosition);
                    gameManager.notifyPlayerKilled(collidingPlayer);
                } else {
                    System.out.println("No colliding non-imposter player found.");
                }
            } else {
                System.out.println("Only imposters can initiate a kill or player not found.");
                // You can optionally log a message or handle this situation accordingly
            }
        } else {
            System.out.println("Imposter is null");
        }
        return playersMap; // Return the updated players map
    }
}
