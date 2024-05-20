package team5.amongus.service;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.PlayerMoveRequest;
import team5.amongus.model.Position;
import team5.amongus.model.CollisionMask;
import team5.amongus.model.Task;

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
                        System.out.println("[PlayerService] doesn't collide with mask");
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

        } catch (IOException e) {
            e.printStackTrace();
        }

        return playersMap;
    }

    private boolean collidesWithMask(Player player, Position.Direction direction, CollisionMask collisionMask) {
        Position nextPosition = player.getPosition().getNextPosition(direction, player.getStep());

        if (collisionMask.collidesWith(nextPosition.getX(), nextPosition.getY(), player.getWidth(), player.getHeight())) {
            System.out.println("[PlayerService] nextPosition: " + nextPosition.getX() + ", " + nextPosition.getY());
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
}

