package team5.amongus.model;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import team5.amongus.model.GameManager; // Import GameManager

@Controller
public class GameController {

    private final GameManager gameManager; // Declare GameManager as a field

    @Autowired // Autowire the GameManager bean
    public GameController(GameManager gameManager) {
        this.gameManager = gameManager;
    }

    @MessageMapping("/startGame")
    @SendTo("/topic/gameStart")
    public String startGame(@Payload List<Player> newPlayers) {
        for (Player player : newPlayers) {
            gameManager.addPlayer(player);
        }
        // Trigger the logic to choose imposters in the GameManager
        gameManager.chooseImposter();
        return "Game started!";
    }
}