package team5.amongus.Backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.Backend.model.*;
import team5.amongus.Backend.model.Position.Direction;

import java.io.IOException;
import java.util.ArrayList;

import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class PlayerService implements IPlayerService {

    @Override
    public Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask,
            ArrayList<Interactible> interactibles) {
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
                    if (existingPlayer.getisAlive()) {
                        if (!collidesWithMask(existingPlayer, direction, collisionMask)) {
                            existingPlayer.handleMovementRequest(direction);
                            existingPlayer.setIsMoving(true);
                        }
                    } else if (!escapingBoundaries(existingPlayer, direction)) {
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
                                ((Imposter) player).setCanKill(true);
                            }
                            break;
                        } else {
                            if (player instanceof Imposter) {
                                ((Imposter) player).setCanKill(false);
                            }
                        }
                    }
                }

                // Check collision with interactibles
                for (Interactible interactible : interactibles) {
                    if (interactible instanceof Task) {
                        if (player.getName().equals(((Task) interactible).getAssignedPlayer())) {
                            if (player.collidesWith(interactible)) {
                                canInteract = true;
                                break;
                            }
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

    private boolean escapingBoundaries(Player existingPlayer, Direction direction) {
        Position nextPosition = existingPlayer.getPosition().getNextPosition(direction, existingPlayer.getStep());

        int maxX = 3900;
        int maxY = 2100;
        int minX = 340;
        int minY = 90;

        if (nextPosition.getX() > maxX || nextPosition.getX() < minX || nextPosition.getY() > maxY
                || nextPosition.getY() < minY) {
            return true;
        }
        return false;
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
        if (player.getisAlive()) {
            for (Interactible object : interactibles) {
                if (object instanceof DeadBody) {
                    if (player.collidesWith(object)) {

                        return object;
                    }
                } else if (object instanceof SabotageTask) {
                    if (player.collidesWith(object)) {
                        return object;
                    }
                }
            }
        }
        for (Interactible object : interactibles) {
            if (object instanceof Task) {
                if (((Task) object).getAssignedPlayer().equals(player.getName())) {
                    if (player.collidesWith(object)) {

                        return object;
                    }
                }
            }
        }

        return null;
    }

    public Map<String, Player> handleKill(Imposter imposter, Map<String, Player> playersMap, String roomCode,
            SimpMessagingTemplate template) {
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
                notifyPlayerKilled(collidingPlayer, roomCode, template);
            } else {
                System.out.println("No colliding non-imposter player found.");
            }
        } else {
            System.out.println("Only imposters can initiate a kill or player not found.");
            // You can optionally log a message or handle this situation accordingly
        }
        return playersMap; // Return the updated players map
    }

    public void notifyPlayerKilled(Player killedPlayer, String roomCode, SimpMessagingTemplate template) {
        String destination = "/topic/killedPlayer/" + roomCode;
        template.convertAndSend(destination, killedPlayer);
    }
}
