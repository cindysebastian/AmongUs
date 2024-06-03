package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.context.event.EventListener;

import team5.amongus.model.*;
import team5.amongus.service.EmergencyMeetingService;
import team5.amongus.service.IChatService;
import team5.amongus.service.IPlayerService;
import team5.amongus.service.ITaskService;
import team5.amongus.service.ICollisionMaskService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Controller
public class WebSocketController {

    private final Map<String, Player> playersMap = new HashMap<>();
    private final Map<String, Player> previousPlayersMap = new HashMap<>();
    private final Map<String, Player> previousinGamePlayersMap = new HashMap<>();
    private ArrayList<Interactible> interactibles = new ArrayList<>();
    private ArrayList<Interactible> previousInteractibles = new ArrayList<>();
    private final Task testTask = new Task(TaskType.SCAN, 500, 500, "dwarf");
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final IChatService chatService;
    private final List<Message> chatMessages = new ArrayList<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;
    private GameManager gameManager;
    private final ICollisionMaskService collisionMaskService;
    private CollisionMask collisionMask;
    private boolean gameStarted = false;
    private EmergencyMeetingService emergencyMeetingService;
    private Map<String, Integer> voteCounts = new HashMap<>();
    private EmergencyMeeting emergencyMeeting;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, IChatService chatService, ICollisionMaskService collisionMaskService,
            GameManager gameManager, EmergencyMeetingService emergencyMeetingService, EmergencyMeeting emergencyMeeting) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.gameManager = gameManager;
        this.collisionMaskService = collisionMaskService;
        this.collisionMask = this.collisionMaskService.loadCollisionMask("/LobbyBG_borders.png");
        this.emergencyMeetingService = emergencyMeetingService;
        this.emergencyMeeting = emergencyMeeting;
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

        Player player = playersMap.get(playerName);

        Interactible interactableObject = playerService.getPlayerInteractableObject(interactibles, player);

        if (interactableObject != null) {
            // Handle interaction based on the type of interactable object
            if (interactableObject instanceof Task) {
                // If the interactable object is a Task, call the TaskService to update task
                ArrayList<Interactible> updatedInteractables = taskService.updateTaskInteractions(playersMap,
                        interactibles, player, (Task) interactableObject);

                interactibles = updatedInteractables;
            }
        }
        broadcastInteractiblesUpdate();
        return interactibles;
    }

    @MessageMapping("/move")
    public void move(String payload) {
        playerService.movePlayer(playersMap, payload, collisionMask);
        broadcastPlayerUpdate();
    }

    @MessageMapping("/move/inGamePlayers")
    public void moveInGamePlayers(String payload) {
        playerService.movePlayer(inGamePlayersMap, payload,
                collisionMask);
        broadcastPlayerUpdate();
    }

    private final long broadcastInterval = 25; // Limit to 30 broadcasts per second
    private long lastBroadcastTime = 0;

    private void broadcastPlayerUpdate() {
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastBroadcastTime < broadcastInterval) {
            // Too soon to broadcast again, ignore this request
            return;
        }

        // Update the last broadcast time
        lastBroadcastTime = currentTime;

        // Check if there are any changes in the playersMap or inGamePlayersMap
        boolean playerMapChanged = !isMapEqual(playersMap, previousPlayersMap);
        boolean inGamePlayerMapChanged = !isMapEqual(inGamePlayersMap, previousinGamePlayersMap);

        // Only broadcast updates if there are changes
        if (playerMapChanged) {
            previousPlayersMap.clear();
            Map<String, Player> clonedPlayersMap = new HashMap<>();
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                String key = entry.getKey();
                Player player = entry.getValue();
                try {
                    clonedPlayersMap.put(key, (Player) player.clone());
                } catch (CloneNotSupportedException e) {
                    e.printStackTrace(); // Handle the exception according to your needs
                }
            }
            previousPlayersMap.putAll(clonedPlayersMap);


            messagingTemplate.convertAndSend("/topic/players", playersMap);

        }

        if (inGamePlayerMapChanged) {
            previousinGamePlayersMap.clear();
            Map<String, Player> clonedInGamePlayersMap = new HashMap<>();
            for (Map.Entry<String, Player> entry : inGamePlayersMap.entrySet()) {
                String key = entry.getKey();
                Player player = entry.getValue();
                try {
                    clonedInGamePlayersMap.put(key, (Player) player.clone());
                } catch (CloneNotSupportedException e) {
                    e.printStackTrace(); // Handle the exception according to your needs
                }
            }
            previousinGamePlayersMap.putAll(clonedInGamePlayersMap);

            
            messagingTemplate.convertAndSend("/topic/inGamePlayers", inGamePlayersMap);

        }

    }

    private boolean isMapEqual(Map<String, Player> map1, Map<String, Player> map2) {

        if (map1.size() != map2.size()) {
            return false;
        }

        for (Map.Entry<String, Player> entry : map1.entrySet()) {
            String key = entry.getKey();
            Player player1 = entry.getValue();
            Player player2 = map2.get(key);
            if (!arePlayersEqual(player1, player2)) {
                return false;
            }
        }

        return true;
    }

    private boolean arePlayersEqual(Player player1, Player player2) {

        if (player1.getPosition().getX() != player2.getPosition().getX()) {
            
            return false;
        }
        if (player1.getPosition().getY() != player2.getPosition().getY()) {
            
            return false;
        }
        if (player1.getisAlive() != player2.getisAlive()) {
            
            return false;
        }
        if (player1.getIsMoving() != player2.getIsMoving()) {
        
            return false;
        }

        return true;
    }

    private void broadcastInteractiblesUpdate() {
        if (!Objects.equals(interactibles, previousInteractibles)) {
            messagingTemplate.convertAndSend("/topic/interactions", interactibles);
            previousInteractibles.clear();
            previousInteractibles.addAll(interactibles);
        }
    }

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor) {
        List<Message> updatedChatMessages = chatService.processMessage(chatMessages, message);
        return updatedChatMessages;
    }

    @MessageMapping("/killPlayer")
    public void handleKill(String playerName) {
        if (playerName == null || playerName.trim().isEmpty()) {
            System.out.println("PlayerName null");

        }

        Imposter imposter = null;
        for (Player pl : playersMap.values()) {
            if (pl instanceof Imposter) {
                imposter = (Imposter) pl;
                break;
            }
        }

        if (imposter == null || !imposter.getName().equals(playerName)) {
            System.err.println("Imposter not found or mismatch");

        }

        playerService.handleKill(imposter, playersMap);
        broadcastPlayerUpdate();

    }

    @MessageMapping("/completeTask")
    @SendTo("/topic/interactions")
    public List<Interactible> completeTask(String payload) {
        ArrayList<Interactible> updatedInteractables = taskService.completeTask(payload, interactibles);
        interactibles = updatedInteractables;
        broadcastInteractiblesUpdate();
        return interactibles;
    }

    @MessageMapping("/startGame")
    @SendTo("/topic/gameStart")
    public String startGame() {
        System.out.println("Game started!");
        gameStarted = true;

        List<Position> positions = new ArrayList<>();
        positions.add(new Position(2175, 350));
        positions.add(new Position(2175, 650));
        positions.add(new Position(2000, 500));
        positions.add(new Position(2400, 500));

        int index = 0;
        for (Map.Entry<String, Player> entry : inGamePlayersMap.entrySet()) {
            entry.getValue().setPosition(positions.get(index));
            playersMap.put(entry.getKey(), entry.getValue());
            index++;
            if (index > 3) {
                index = 0;
            }
        }

        gameManager.chooseImposter(playersMap);
        inGamePlayersMap.clear();

        collisionMask = collisionMaskService.loadCollisionMask("/spaceShipBG_borders.png");
        interactibles = taskService.createTasks(playersMap);

        broadcastInteractiblesUpdate();
        return "Game has started";
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        boolean isFirstPlayer = false;
        String firstPlayerName = "";

        if (!inGamePlayersMap.isEmpty()) {
            firstPlayerName = inGamePlayersMap.keySet().iterator().next();
            isFirstPlayer = inGamePlayersMap.get(firstPlayerName).getSessionId().equals(sessionId);
        }

        for (Iterator<Map.Entry<String, Player>> iterator = inGamePlayersMap.entrySet().iterator(); iterator
                .hasNext();) {
            Map.Entry<String, Player> entry = iterator.next();
            Player player = entry.getValue();
            if (player.getSessionId() != null && player.getSessionId().equals(sessionId)) {
                iterator.remove();
                playersMap.remove(entry.getKey());
                broadcastPlayerUpdate();
                break;
            }
        }

        if (isFirstPlayer && !inGamePlayersMap.isEmpty()) {
            String nextPlayerName = inGamePlayersMap.keySet().iterator().next();
            messagingTemplate.convertAndSend("/topic/nextPlayerStartButton", nextPlayerName);
        }

        for (Iterator<Map.Entry<String, Player>> iterator = playersMap.entrySet().iterator(); iterator.hasNext();) {
            Map.Entry<String, Player> entry = iterator.next();
            Player player = entry.getValue();
            if (player.getSessionId() != null && player.getSessionId().equals(sessionId)) {
                iterator.remove();
                broadcastPlayerUpdate();
                break;
            }
        }
    }

    @MessageMapping("/emergencyMeeting")
    public void emergencyMeeting(String playerName) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting", playerName);
    }

    @MessageMapping("/vote")
    public void handleVote(String payload) {
        // Assuming payload contains playerName and votedPlayer separated by a comma
        String[] parts = payload.split(",");
        if (parts.length == 2) {
            String playerName = parts[0].trim();
            String votedPlayer = parts[1].trim();
            emergencyMeeting.handleVoting(playerName, votedPlayer);
            if (emergencyMeeting.allPlayersVoted()) {
                emergencyMeeting.submitVotes();
            }
        }
    }
    
}
