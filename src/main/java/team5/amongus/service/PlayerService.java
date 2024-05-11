// PlayerServiceImpl.java
package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PlayerService implements IPlayerService {

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

                player.setCanInteract(canInteract);
            }

            // Broadcast updated player positions to all clients
            return playersMap;

        } catch (IOException e) {
            e.printStackTrace();
            return playersMap; // Return the current player map if an error occurs
        }
    }

    @Override
    public Interactible getPlayerInteractableObject(ArrayList<Interactible> interactibles, Player player) {
        System.out.println(player);
        System.out.println(interactibles);
      
        for (Interactible object : interactibles) {
            if (player.collidesWith(object)) {
                return object;
            }

        }
        return null;
    }

}
