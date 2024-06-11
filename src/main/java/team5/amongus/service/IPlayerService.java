// PlayerService.java
package team5.amongus.service;

import team5.amongus.model.CollisionMask;
import team5.amongus.model.Imposter;
import team5.amongus.model.Interactible;
import team5.amongus.model.Player;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;

public interface IPlayerService {
    Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask, ArrayList<Interactible> interactibles);

    Interactible getPlayerInteractableObject(ArrayList<Interactible> interactibles, Player player);

    Map<String, Player> handleKill(Imposter imposter, Map<String, Player> playersMap, String roomCode, SimpMessagingTemplate messagingTemplate);
}