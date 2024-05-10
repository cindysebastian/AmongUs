package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import team5.amongus.model.Message;
import team5.amongus.model.Player;
import team5.amongus.service.IChatService;
import team5.amongus.service.IPlayerService;
import team5.amongus.service.ITaskService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final IChatService chatService;
    private final List<Message> chatMessages = new ArrayList<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;
    private boolean gameStarted = false;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService, ITaskService taskService, IChatService chatService) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/setPlayer")
    @SendTo("/topic/inGamePlayers")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return inGamePlayersMap; // Do not add invalid player
        }

        inGamePlayersMap.put(playerName, player);

        // Broadcast updated player list to all clients
        broadcastPlayerUpdate();

        return inGamePlayersMap;
    }

    @MessageMapping("/interact")
    @SendTo("/topic/game")
    public void handleInteract() throws IOException {

    }


    @MessageMapping("/move")
    @SendTo("/topic/players")
    public Map<String, Player> move(String payload) {
        Map<String, Player> updatedPlayersMap = playerService.movePlayer(playersMap, payload);
        taskService.updateTaskInteractions(updatedPlayersMap);
        broadcastPlayerUpdate();
        return updatedPlayersMap;
    }

    @MessageMapping("/move/inGamePlayers")
    @SendTo("/topic/inGamePlayers")
    public Map<String, Player> moveInGamePlayers(String payload) {
        Map<String, Player> updatedPlayersMap = playerService.movePlayer(playersMap, payload);
        taskService.updateTaskInteractions(updatedPlayersMap);
        broadcastPlayerUpdate();
        return updatedPlayersMap;
    }

    private void broadcastPlayerUpdate() {
        messagingTemplate.convertAndSend("/topic/players", playersMap);
        messagingTemplate.convertAndSend("/topic/inGamePlayers", inGamePlayersMap);
    }

    
    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        List<Message> updatedChatMessages = chatService.processMessage(chatMessages, message);
        return updatedChatMessages;
    }

    @MessageMapping("/startGame")
    @SendTo("/topic/gameStart")
    public String startGame() {
        System.out.println("Game started!"); // Add logging
        gameStarted = true; // Set gameStarted flag to true
    
        // Move players from lobby to spaceship
        for (Map.Entry<String, Player> entry : inGamePlayersMap.entrySet()) {
            playersMap.put(entry.getKey(), entry.getValue());
        }
    
        // Clear the players from the lobby
        inGamePlayersMap.clear();
    
        // Logging to check spaceShipPlayersMap contents
        System.out.println("Space ship players count: " + playersMap.size());
        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            System.out.println("Player: " + entry.getKey() + ", Position: " + entry.getValue().getPosition());
        }
    
        return "Game has started";
    }
}