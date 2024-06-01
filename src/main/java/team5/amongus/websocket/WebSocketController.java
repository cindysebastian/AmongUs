package team5.amongus.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;

import team5.amongus.model.*;
import team5.amongus.service.IChatService;
import team5.amongus.service.IPlayerService;
import team5.amongus.service.ITaskService;
import team5.amongus.service.ICollisionMaskService;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Room> activeRooms = new HashMap<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;
    private final ICollisionMaskService collisionMaskService;
    private CollisionMask collisionMask;
    private final IChatService chatService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, IChatService chatService, ICollisionMaskService collisionMaskService) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.collisionMaskService = collisionMaskService;
        this.collisionMask = this.collisionMaskService.loadCollisionMask("/LobbyBG_borders.png");
    }

    @MessageMapping("/hostGame")
    public void hostGame(@Payload HostGameRequest request) {
        Room room = new Room();
        Position position = new Position(500, 500);
        activeRooms.put(room.getRoomCode(), room);
        room.addPlayer(new Player(request.getPlayerName(), position));
        HostGameResponse response = new HostGameResponse("OK", room.getRoomCode());
        messagingTemplate.convertAndSend("/topic/hostResponse", response);
    }

    @MessageMapping("/topic/players/{roomCode}")
    public void subscribeToPlayers(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        room.broadcastPlayerUpdate(messagingTemplate);
    }

    @MessageMapping("/topic/inGamePlayers/{roomCode}")
    public void subscribeToInGamePlayers(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        room.broadcastPlayerUpdate(messagingTemplate);
    }

    @MessageMapping("/joinGame")
    @SendToUser("/queue/joinResponse")
    public Map<String, Object> joinGame(@Payload String playerName, @DestinationVariable String roomCode) {

        Map<String, Object> response = new HashMap<>();

        if (activeRooms.get(roomCode) != null) {
            Room room = activeRooms.get(roomCode);
            room.addPlayer(new Player(playerName));
            room.broadcastPlayerUpdate(messagingTemplate);
        }

        // Add response parameters
        response.put("status", "OK");
        response.put("roomCode", roomCode);

        return response;
    }

    public void removePlayer(String playerName, Room room) {
        room.getInGamePlayersMap().remove(playerName);
        room.getPlayersMap().remove(playerName);
        room.broadcastPlayerUpdate(messagingTemplate);
    }

    @MessageMapping("/heartbeat/{roomCode}")
    public void handleHeartbeat(String playerName, @DestinationVariable String roomCode) {

        Room room = activeRooms.get(roomCode);
        Player inGameplayer = room.getInGamePlayersMap().get(playerName);
        Player player = room.getPlayersMap().get(playerName);
        if (player != null && inGameplayer != null) {
            player.updateLastActivityTime();
            inGameplayer.updateLastActivityTime();
        }
    }

    @MessageMapping("/interact/{roomCode}")
    @SendTo("/topic/interactions/{roomCode}")
    public ArrayList<Interactible> handleInteract(@Payload String playerName, @DestinationVariable String roomCode)
            throws IOException {
        Room room = activeRooms.get(roomCode);
        if (room == null) {
            // Handle case where the room doesn't exist
            return new ArrayList<>(); // Return an empty list or handle as appropriate
        }

        Player player = room.getPlayersMap().get(playerName);
        if (player == null) {
            // Handle case where player doesn't exist in the room
            return new ArrayList<>(); // Return an empty list or handle as appropriate
        }

        Interactible interactableObject = playerService.getPlayerInteractableObject(room.getInteractibles(), player);

        if (interactableObject != null) {
            // Handle interaction based on the type of interactable object
            if (interactableObject instanceof Task) {
                // If the interactable object is a Task, call the TaskService to update task
                ArrayList<Interactible> updatedInteractables = taskService.updateTaskInteractions(room.getPlayersMap(),
                        room.getInteractibles(), player, (Task) interactableObject);

                room.setInteractibles(updatedInteractables);
            }
        }
        room.broadcastInteractiblesUpdate(messagingTemplate);
        return room.getInteractibles();
    }

    @MessageMapping("/move/{roomCode}")
    public void move(String payload, @DestinationVariable String roomCode) {
       
        Room room = activeRooms.get(roomCode);
        if (room == null) {
            // Handle case where the room doesn't exist
            return;
        }

        if (room.getGameStarted()) {
            playerService.movePlayer(room.getPlayersMap(), payload, collisionMask);
        } else {
            playerService.movePlayer(room.getInGamePlayersMap(), payload, collisionMask);
        }

        room.broadcastPlayerUpdate(messagingTemplate);
        System.out.println(room.getInGamePlayersMap());
    }

    @MessageMapping("/sendMessage/{roomCode}")
    @SendTo("/topic/messages/{roomCode}")
    public List<Message> sendMessages(Message message, SimpMessageHeaderAccessor accessor,
            @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        List<Message> updatedChatMessages = chatService.processMessage(room.getChatMessages(), message);
        room.setMessages(updatedChatMessages);
        return updatedChatMessages;
    }

    @MessageMapping("/killPlayer/{roomCode}")
    public void handleKill(String playerName, @DestinationVariable String roomCode) {
        if (playerName == null || playerName.trim().isEmpty()) {
            System.out.println("PlayerName null");

        }

        Room room = activeRooms.get(roomCode);

        Imposter imposter = null;
        for (Player pl : room.getPlayersMap().values()) {
            if (pl instanceof Imposter) {
                imposter = (Imposter) pl;
                break;
            }
        }

        if (imposter == null || !imposter.getName().equals(playerName)) {
            System.err.println("Imposter not found or mismatch");
        }

        playerService.handleKill(imposter, room.getPlayersMap());
        room.broadcastPlayerUpdate(messagingTemplate);

    }

    @MessageMapping("/completeTask/{roomCode}")
    public void completeTask(String payload, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);

        ArrayList<Interactible> updatedInteractables = taskService.completeTask(payload, room.getInteractibles());
        room.setInteractibles(updatedInteractables);
        room.broadcastInteractiblesUpdate(messagingTemplate);
    }

    @MessageMapping("/startGame/{roomCode}")
    @SendTo("/topic/gameStart/{roomCode}")
    public String startGame(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        System.out.println("Game started!");
        room.setGameStarted(true);

        List<Position> positions = new ArrayList<>();
        positions.add(new Position(2175, 350));
        positions.add(new Position(2175, 650));
        positions.add(new Position(2000, 500));
        positions.add(new Position(2400, 500));

        int index = 0;
        for (Map.Entry<String, Player> entry : room.getInGamePlayersMap().entrySet()) {
            entry.getValue().setPosition(positions.get(index));
            room.getPlayersMap().put(entry.getKey(), entry.getValue());
            index++;
            if (index > 3) {
                index = 0;
            }
        }

        room.chooseImposter();
        room.getInGamePlayersMap().clear();

        collisionMask = collisionMaskService.loadCollisionMask("/spaceShipBG_borders.png");
        room.setInteractibles(taskService.createTasks(room.getPlayersMap()));

        room.broadcastPlayerUpdate(messagingTemplate);
        room.broadcastInteractiblesUpdate(messagingTemplate);
        return "Game has started";
    }

    /*
     * @EventListener
     * public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
     * String sessionId = event.getSessionId();
     * 
     * boolean isFirstPlayer = false;
     * String firstPlayerName = "";
     * 
     * if (!inGamePlayersMap.isEmpty()) {
     * firstPlayerName = inGamePlayersMap.keySet().iterator().next();
     * isFirstPlayer =
     * inGamePlayersMap.get(firstPlayerName).getSessionId().equals(sessionId);
     * }
     * 
     * for (Iterator<Map.Entry<String, Player>> iterator =
     * inGamePlayersMap.entrySet().iterator(); iterator
     * .hasNext();) {
     * Map.Entry<String, Player> entry = iterator.next();
     * Player player = entry.getValue();
     * if (player.getSessionId() != null && player.getSessionId().equals(sessionId))
     * {
     * iterator.remove();
     * playersMap.remove(entry.getKey());
     * broadcastPlayerUpdate();
     * break;
     * }
     * }
     * 
     * if (isFirstPlayer && !inGamePlayersMap.isEmpty()) {
     * String nextPlayerName = inGamePlayersMap.keySet().iterator().next();
     * messagingTemplate.convertAndSend("/topic/nextPlayerStartButton",
     * nextPlayerName);
     * }
     * 
     * for (Iterator<Map.Entry<String, Player>> iterator =
     * playersMap.entrySet().iterator(); iterator.hasNext();) {
     * Map.Entry<String, Player> entry = iterator.next();
     * Player player = entry.getValue();
     * if (player.getSessionId() != null && player.getSessionId().equals(sessionId))
     * {
     * iterator.remove();
     * broadcastPlayerUpdate();
     * break;
     * }
     * }
     * }
     */
}
