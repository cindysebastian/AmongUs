package team5.amongus.websocket;

import team5.amongus.model.Player;

import java.util.*;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final List<Player> players = new ArrayList<Player>();

    @MessageMapping("setPlayer")
    @SendTo("topic/players")
    public synchronized List<Player> setPlayer(Player player) {
        players.add(player);
        return players;
    }

    @MessageMapping("/move")
    @SendTo("/topic/player-position")
    public synchronized Player move(Player player) {
        return player;
    }
}
