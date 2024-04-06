package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import team5.amongus.model.Player;

import java.util.HashMap;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();

    @MessageMapping("/setPlayer")
    @SendTo("/topic/players")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String sessionId = accessor.getSessionId();
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Do not add invalid player
        }

        playersMap.put(playerName, player);
        return playersMap;
    }

    @MessageMapping("/move")
    @SendTo("/topic/players")
    public Map<String, Player> move(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Ignore invalid move requests
        }

        playersMap.put(playerName, player);
        return playersMap;
    }
}
