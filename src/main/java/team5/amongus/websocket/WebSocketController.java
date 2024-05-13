package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.context.event.EventListener;

import team5.amongus.model.*;
import team5.amongus.service.IChatService;
import team5.amongus.service.IPlayerService;
import team5.amongus.service.ITaskService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();
    private ArrayList<Interactible> interactibles = new ArrayList<>();
    private final Task testTask = new Task(TaskType.SCAN, 500, 500, "dwarf");     
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final IChatService chatService;
    private final List<Message> chatMessages = new ArrayList<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;
    private boolean gameStarted = false;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, IChatService chatService) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    public void removePlayer(String playerName) {
        playersMap.remove(playerName);
        inGamePlayersMap.remove(playerName);
        broadcastPlayerUpdate();
    }

    @MessageMapping("/heartbeat")
    public void handleHeartbeat(String playerName) {
        Player inGameplayer = inGamePlayersMap.get(playerName);
        Player player = playersMap.get(playerName);
        if (player != null && inGameplayer != null) {
            player.updateLastActivityTime();
            inGameplayer.updateLastActivityTime();
        }
    }

    @MessageMapping("/setPlayer")
    @SendTo("/topic/inGamePlayers")
    public Map<String, Player> setPlayer(Player player, SimpMessageHeaderAccessor accessor) {
        String playerName = player.getName().trim();

        // Check if player name is not empty and not "player"
        if (playerName.isEmpty() || playerName.equalsIgnoreCase("player")) {
            return inGamePlayersMap; // Do not add invalid player
        }

        String sessionId = accessor.getSessionId();
        player.setSessionId(sessionId);

        inGamePlayersMap.put(playerName, player);

        // Broadcast updated player list to all clients
        broadcastPlayerUpdate();

        return inGamePlayersMap;
    }

    @MessageMapping("/interact")
    @SendTo("/topic/interactions")
    public ArrayList<Interactible> handleInteract(String playerName) throws IOException {
        interactibles.add(testTask);

        /* TODO to be fixed once we get a response
        Player player = playersMap.get(playerName);
        System.out.println(player + " Object in Controller");
               
        Interactible interactableObject = playerService.getPlayerInteractableObject(interactibles, player);*/

        Map.Entry<String, Player> entry = playersMap.entrySet().iterator().next();
        System.out.println(entry.getKey());
        System.out.println(entry.getValue());

        Player player = entry.getValue();

        Interactible interactableObject = testTask;

        if (interactableObject != null) {
            // Handle interaction based on the type of interactable object
            if (interactableObject instanceof Task) {
                // If the interactable object is a Task, call the TaskService to update task
                ArrayList<Interactible> updatedInteractables = taskService.updateTaskInteractions(playersMap, interactibles, player, (Task) interactableObject);
                // Broadcast updated task list to all clients
                System.out.println("Sending updated Interactibles");
                interactibles= updatedInteractables;

            } /*else if (interactableObject instanceof deadBody) {
                // If the interactable object is something else, handle it accordingly
                otherService.handleInteraction(player, (OtherInteractableObject) interactableObject);
            }*/
        }
        return interactibles;

    }

    @MessageMapping("/move")
    @SendTo("/topic/players")
    public Map<String, Player> move(String payload) {
        Map<String, Player> updatedPlayersMap = playerService.movePlayer(playersMap, payload);
        broadcastPlayerUpdate();
        return updatedPlayersMap;
    }

    @MessageMapping("/move/inGamePlayers")
    @SendTo("/topic/inGamePlayers")
    public Map<String, Player> moveInGamePlayers(String payload) {
        Map<String, Player> updatedinGamePlayersMap = playerService.movePlayer(inGamePlayersMap, payload);
       
        broadcastPlayerUpdate();
        return updatedinGamePlayersMap;
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

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        
        // Iterate over inGamePlayersMap to find the disconnected player
        for (Iterator<Map.Entry<String, Player>> iterator = inGamePlayersMap.entrySet().iterator(); iterator.hasNext();) {
            Map.Entry<String, Player> entry = iterator.next();
            Player player = entry.getValue();
            if (player.getSessionId() != null && player.getSessionId().equals(sessionId)) {
                // Remove the disconnected player from both maps
                iterator.remove(); // Remove from inGamePlayersMap
                playersMap.remove(entry.getKey()); // Remove from playersMap
                broadcastPlayerUpdate(); // Broadcast updated player list
                break;
            }
        }
    
        // Iterate over playersMap to find the disconnected player in the spaceship
        for (Iterator<Map.Entry<String, Player>> iterator = playersMap.entrySet().iterator(); iterator.hasNext();) {
            Map.Entry<String, Player> entry = iterator.next();
            Player player = entry.getValue();
            if (player.getSessionId() != null && player.getSessionId().equals(sessionId)) {
                // Remove the disconnected player from playersMap
                iterator.remove(); // Remove from playersMap
                broadcastPlayerUpdate(); // Broadcast updated player list
                break;
            }
        }
    }
}
