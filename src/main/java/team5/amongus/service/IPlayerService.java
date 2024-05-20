// PlayerService.java
package team5.amongus.service;

import team5.amongus.model.CollisionMask;
import team5.amongus.model.Interactible;
import team5.amongus.model.Player;

import java.util.ArrayList;
import java.util.Map;

public interface IPlayerService {
    Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload, CollisionMask collisionMask);

    Interactible getPlayerInteractableObject(ArrayList<Interactible> interactibles, Player player);
}