package team5.amongus.model;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    @MessageMapping("/startGame")
    @SendTo("/topic/gameStart")
    public String startGame() {
        return "Game has started";
    }
}