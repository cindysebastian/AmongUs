package team5.amongus.model;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class GameController {

    @MessageMapping("/startGame") // Define the endpoint for handling the start game message
    @SendTo("/topic/gameStart")   // Broadcast the game start message to all clients subscribed to /topic/gameStart
    public String startGame() {
        // Perform any necessary game initialization logic here
        return "Game has started"; // You can customize the message if needed
    }
}