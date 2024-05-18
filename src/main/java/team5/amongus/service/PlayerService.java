package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;
import team5.amongus.model.Position;
import team5.amongus.model.CollisionMask;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PlayerService implements IPlayerService {

    @Override
    public Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask) {
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
                for (String directionStr : directions) {
                    Position.Direction direction = Position.Direction.valueOf(directionStr.toUpperCase());
                    // Check if the next position will collide with the collision mask
                    if (!collidesWithMask(existingPlayer, direction, collisionMask)) {
                        System.out.println("doesn't collide with mask");
                        existingPlayer.handleMovementRequest(direction);
                    }
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

            // Calculate new player positions and update the map
            Position newPosition = existingPlayer.getPosition();

            System.out.println("Updated position for player " + playerName + ": " + newPosition.toString());

        } catch (IOException e) {
            e.printStackTrace();
        }

        return playersMap;
    }

    private boolean collidesWithMask(Player player, Position.Direction direction, CollisionMask collisionMask) {
        Position nextPosition = player.getPosition().getNextPosition(direction, player.getStep());

        // Get the dimensions of the mask
        int maskWidth = collisionMask.getImageWidth();
        int maskHeight = collisionMask.getImageHeight();
        int x = nextPosition.getX();
        int y = nextPosition.getY();

        // Check if the position is out of bounds
        if (x < 0 || x >= maskWidth || y < 0 || y >= maskHeight) {
            System.out.println("Out of bounds");
            return true; // Out of bounds, considered as collision
        }

        if(collisionMask.collidesWith(nextPosition.getX(), nextPosition.getY(), player.getWidth(), player.getHeight())){
            return true;
        }

        return false;
    }
}
