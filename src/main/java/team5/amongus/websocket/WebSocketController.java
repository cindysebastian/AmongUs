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
    private final ArrayList<Interactible> interactibles = new ArrayList<>(); 
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
    public void handleInteract(Player player) throws IOException {
        // Assuming you have logic to determine the type of interactable object the
        // player is interacting with
        // For demonstration, let's say you have a method
        // getPlayerInteractableObject(Player player) in your service

        // Retrieve the interactable object the player is interacting with
        Interactible interactableObject = playerService.getPlayerInteractableObject(interactibles, player);

        if (interactableObject != null) {
            // Handle interaction based on the type of interactable object
            if (interactableObject instanceof Task) {
                // If the interactable object is a Task, call the TaskService to update task
                taskService.updateTaskInteractions(playersMap, interactibles, player, (Task) interactableObject);
                // Broadcast updated task list to all clients
                messagingTemplate.convertAndSend("/topic/tasks", interactibles);

            } /*else if (interactableObject instanceof deadBody) {
                // If the interactable object is something else, handle it accordingly
                otherService.handleInteraction(player, (OtherInteractableObject) interactableObject);
            }*/
        }
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
}
