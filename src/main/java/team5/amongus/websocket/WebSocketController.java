package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import team5.amongus.model.*;
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
    private ArrayList<Interactible> interactibles = new ArrayList<>();
    private final Task testTask = new Task(TaskType.SCAN, 500, 500, "dwarf");     
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

    private void broadcastPlayerUpdate() {
        messagingTemplate.convertAndSend("/topic/players", playersMap);
    }

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        List<Message> updatedChatMessages = chatService.processMessage(chatMessages, message);
        return updatedChatMessages;
    }

    @Controller
    public class GameController {

        @MessageMapping("/startGame")
        @SendTo("/topic/gameStart")
        public String startGame() {
            return "Game has started";
        }
    }
}
