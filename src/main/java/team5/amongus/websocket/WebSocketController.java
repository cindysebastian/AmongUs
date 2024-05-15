package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Imposter;
import team5.amongus.model.Message;
import team5.amongus.model.Player;
import team5.amongus.model.Position;
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

    private Map<String, Player> playersMap = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final IChatService chatService;
    private final List<Message> chatMessages = new ArrayList<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, IChatService chatService) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/setPlayer")
    @SendTo("/topic/players")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return playersMap; // Do not add invalid player
        }

        playersMap.put(playerName, player);

        // Broadcast updated player list to all clients
        broadcastPlayerUpdate();

        return playersMap;
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
        playersMap = updatedPlayersMap;
        return updatedPlayersMap;
    }

    private void broadcastPlayerUpdate() {
        messagingTemplate.convertAndSend("/topic/players", playersMap);
    }

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        List<Message> updatedChatMessages = chatService.processMessage(chatMessages, message);
        return updatedChatMessages;
    }

    @MessageMapping("/killPlayer")
    @SendTo("/topic/players")
    public Map<String, Player> handleKill(String playerName) {
        // Proceed with handling the kill
        Player player = playersMap.get(playerName);
        System.out.println(playerName);
        System.out.println(player);
        
        System.out.println("Get playername...");
        
        // If playerName is still null, return the current player map
        if (playerName == null || playerName.trim().isEmpty()) {            
            System.out.println("PlayerName null");
            return playersMap;
        }

        System.out.println(playerName);

        // Proceed with handling the kill
        System.out.println("handlekill aufruf");
        Map<String, Player> updatedPlayersMap = playerService.handleKill(player, playersMap);
        broadcastPlayerUpdate(); // Broadcast the updated player state to clients
        return updatedPlayersMap;
    }



}
