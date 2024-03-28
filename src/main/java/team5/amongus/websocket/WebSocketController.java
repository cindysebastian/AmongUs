package team5.amongus.websocket;

import team5.amongus.model.PlayerPosition;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    @MessageMapping("/move")
    @SendTo("/topic/player-position")
    public PlayerPosition move(PlayerPosition position) {
        return position;
    }
}
