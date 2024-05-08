// PlayerService.java
package team5.amongus.service;

import team5.amongus.model.Player;

import java.util.Map;

public interface IPlayerService {
    Map<String, Player> movePlayer(Map<String, Player> playersMap, String payload);

    Map<String, Player> handleKill(String playerName, Map<String, Player> playersMap);
}