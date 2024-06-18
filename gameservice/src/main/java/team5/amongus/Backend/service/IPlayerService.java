// PlayerService.java
package team5.amongus.Backend.service;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import team5.amongus.Backend.model.CollisionMask;
import team5.amongus.Backend.model.Imposter;
import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;

public interface IPlayerService {
    Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask, ArrayList<Interactible> interactibles);

    Interactible getPlayerInteractableObject(ArrayList<Interactible> interactibles, Player player);

    Map<String, Player> handleKill(Imposter imposter, Map<String, Player> playersMap, String roomCode, SimpMessagingTemplate messagingTemplate);
}