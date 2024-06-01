package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.*;

import java.io.IOException;
import java.util.ArrayList;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class PlayerService implements IPlayerService {


    @Override
    public Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask) {
        try {
            final ObjectMapper objectMapper = new ObjectMapper();

            PlayerMoveRequest moveRequest = objectMapper.readValue(payload, PlayerMoveRequest.class);

            String playerName = moveRequest.getPlayerName();
            List<String> directions = moveRequest.getDirections();

            if (playerName == null || playerName.isEmpty() || directions == null) {
                return playersMap; // Ignore move requests without player name or directions
            }

            Player existingPlayer = playersMap.get(playerName);
            if (existingPlayer == null) {
                return playersMap; // Player not found
            }

            if (directions.isEmpty()) {
                existingPlayer.setIsMoving(false);
            } else {
                for (String directionStr : directions) {
                    Position.Direction direction = Position.Direction.valueOf(directionStr.toUpperCase());
                    if (!collidesWithMask(existingPlayer, direction, collisionMask)) {
                        existingPlayer.handleMovementRequest(direction);
                        existingPlayer.setIsMoving(true);
                    }
                }
            }
            playersMap.put(playerName, existingPlayer);

            for (Player player : playersMap.values()) {
                boolean canInteract = false;

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

                player.setCanInteract(canInteract);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        return playersMap;
    }

    private boolean collidesWithMask(Player player, Position.Direction direction, CollisionMask collisionMask) {
        Position nextPosition = player.getPosition().getNextPosition(direction, player.getStep());

        if (collisionMask.collidesWith(nextPosition.getX(), nextPosition.getY(), player.getWidth(),
                player.getHeight())) {
            return true;
        }

        return false;
    }

    @Override
    public Interactible getPlayerInteractableObject(ArrayList<Interactible> interactibles, Player player) {

        for (Interactible object : interactibles) {
            if (((Task) object).getAssignedPlayer() == player.getName()) {
                if (player.collidesWith(object)) {

                    return object;
                }
            }

        }
        return null;
    }

    public Map<String, Player> handleKill(Imposter imposter, Map<String, Player> playersMap) {
        System.out.println("Trying to kill...");
        if (imposter != null && playersMap != null) {
            Player collidingPlayer = null;
            // Iterate through other players to find the closest one
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                String name = entry.getKey();
                Player player = entry.getValue();
                if (!name.equals(imposter.getName()) && !(player instanceof Imposter)) { // Exclude the player
                                                                                         // initiating
                    if (imposter.collidesWith(player) && player.getisAlive()) {
                        collidingPlayer = player;
                        break;
                    }
                }
            }

            if (collidingPlayer != null && collidingPlayer.getisAlive()) {
                System.out.println("Killing " + collidingPlayer.getName());
                imposter.kill(collidingPlayer);
                Position newPosition = new Position(collidingPlayer.getPosition().getX(),
                        collidingPlayer.getPosition().getY());
                imposter.setPosition(newPosition);
            } else {
                System.out.println("No colliding non-imposter player found.");
            }
        } else {
            System.out.println("Only imposters can initiate a kill or player not found.");
            // You can optionally log a message or handle this situation accordingly
        }
        return playersMap; // Return the updated players map
    }
}
