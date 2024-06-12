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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.context.event.EventListener;
import org.springframework.security.core.Authentication;

import team5.amongus.model.*;
import team5.amongus.service.EmergencyMeetingService;
import team5.amongus.service.IChatService;
import team5.amongus.service.IPlayerService;
import team5.amongus.service.ISabotageService;
import team5.amongus.service.ITaskService;
import team5.amongus.service.ICollisionMaskService;
import team5.amongus.service.IGameWinningService;

import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Room> activeRooms = new HashMap<>();
    private final IPlayerService playerService;
    private final ITaskService taskService;
    private final ICollisionMaskService collisionMaskService;
    private final ISabotageService sabotageService;
    private CollisionMask collisionMaskLobby;
    private CollisionMask collisionMaskGame;
    private final IChatService chatService;
    private EmergencyMeetingService emergencyMeetingService;
    private Map<String, Integer> voteCounts = new HashMap<>();
    private EmergencyMeeting emergencyMeeting;
    private Set<String> usedRoomCodes = new HashSet<>();

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, IChatService chatService, ICollisionMaskService collisionMaskService,
            ISabotageService sabotageService, EmergencyMeetingService emergencyMeetingService,
            EmergencyMeeting emergencyMeeting) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.sabotageService = sabotageService;
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
        this.collisionMaskService = collisionMaskService;
        this.collisionMaskLobby = this.collisionMaskService.loadCollisionMask("/LobbyBG_borders.png");
        this.collisionMaskGame = this.collisionMaskService.loadCollisionMask("/spaceShipBG_borders.png");
        this.emergencyMeetingService = emergencyMeetingService;
        this.emergencyMeeting = emergencyMeeting;
    }

    @MessageMapping("/hostGame")
    public void hostGame(@Payload HostGameRequest request) {
        String roomCode;
        Room room;

        // Generate a unique room code
        synchronized (usedRoomCodes) {
            do {
                room = new Room(request.getPlayerCount(), request.getPlayerName());
                roomCode = room.getRoomCode();
            } while (!usedRoomCodes.add(roomCode)); // Add the code to the set
        }

        Position position = new Position(900, 500);
        activeRooms.put(roomCode, room);
        Player host = new Player(request.getPlayerName(), position);
        host.setIsHost(true);
        room.addPlayer(host);
        HostGameResponse response = new HostGameResponse("OK", roomCode);
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

    @MessageMapping("/joinGame/{roomCode}")
    public void joinGame(@Payload JoinGameRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (activeRooms.get(request.getRoomCode()) != null) {
            Room room = activeRooms.get(request.getRoomCode());
            Position position = new Position(900, 500);
            if (room.getInGamePlayersMap().get(request.getPlayerName()) == null) {
                if (room.getInGamePlayersMap().size() < room.getMaxPlayers()) {

                    room.addPlayer(new Player(request.getPlayerName(), position));
                    room.broadcastPlayerUpdate(messagingTemplate);
                    response.put("status", "OK");
                    response.put("roomCode", room.getRoomCode());
                } else {
                    response.put("status", "FULL");
                    response.put("roomCode", null);
                }
            } else {
                response.put("status", "NAME_TAKEN");
                response.put("roomCode", null);
            }
        } else {
            response.put("status", "NO_SUCH_ROOM");
            response.put("roomCode", null);
        }

        messagingTemplate.convertAndSend("/topic/joinResponse", response);
    }

    // TODO: Make Functional/remove if redundant
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
            } else if (interactableObject instanceof DeadBody) {
                if (room.getPlayersMap().get(playerName).getisAlive()) {
                    ((DeadBody) interactableObject).setFound(true);
                    Iterator<Interactible> iterator = room.getInteractibles().iterator();
                    while (iterator.hasNext()) {
                        Interactible interactible = iterator.next();
                        if (interactible instanceof DeadBody) {
                            iterator.remove(); // Safe removal using iterator
                        }
                    }

                    System.out.println("Triggering Emergency Meeting, dead body found");
                } else {
                    System.out.println("Dead Players cannot report bodies.");
                }
                emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), roomCode);
                messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
                // TODO FOR MARTINA: add proper trigger for Emergency Meeting, dead body
                // behaviour is fully handled (When found, disappears), only need to add
                // functionality here to start the meeting
            } else if (interactableObject instanceof EmergencyMeetingButton) {
                emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), roomCode);
            }
        }
        room.broadcastInteractiblesUpdate(messagingTemplate);
        return room.getInteractibles();
    }

    @MessageMapping("/interactWithSabotage/{roomCode}")
    @SendTo("/topic/sabotages/{roomCode}")
    public ArrayList<Interactible> handleSabotageTaskInteract(@Payload String playerName,
            @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        if (room == null) {
            return new ArrayList<>();
        }

        Player player = room.getPlayersMap().get(playerName);
        if (player == null) {
            return new ArrayList<>();
        }

        Interactible obj = playerService.getPlayerInteractableObject(room.getSabotageTasks(), player);

        if (obj != null) {
            if (obj instanceof SabotageTask) {
                ArrayList<Interactible> updatedSabTasks = sabotageService
                        .updateSabotageTaskInteractions(room.getSabotageTasks(), player, (SabotageTask) obj);
                room.setSabotageTasks(updatedSabTasks);
            }
        }
        room.broadCastSabotageTasksUpdate(messagingTemplate);
        return room.getSabotageTasks();
    }

    @MessageMapping("/move/{roomCode}")
    public void move(String payload, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        if (room == null) {
            // Handle case where the room doesn't exist
            System.out.println("room doesn't exist " + roomCode);
            return;
        }

        if (room.getGameStarted().equals("Game running")) {
            playerService.movePlayer(room.getPlayersMap(), payload, collisionMaskGame, room.getInteractibles());
        } else if (room.getGameStarted().equals("Game waiting")) {
            playerService.movePlayer(room.getInGamePlayersMap(), payload, collisionMaskLobby, room.getInteractibles());
        }

        room.broadcastPlayerUpdate(messagingTemplate);
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
        playerService.handleKill(imposter, room.getPlayersMap(), roomCode, messagingTemplate);
        taskService.generateDeadBody(imposter, room);

        room.broadcastPlayerUpdate(messagingTemplate);
        room.broadcastInteractiblesUpdate(messagingTemplate);
    }

    @MessageMapping("/completeTask/{roomCode}")
    public void completeTask(String payload, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);

        ArrayList<Interactible> updatedInteractables = taskService.completeTask(payload, room.getInteractibles());
        room.setInteractibles(updatedInteractables);
        room.broadcastInteractiblesUpdate(messagingTemplate);
    }

    @MessageMapping("/completeSabotageTask/{roomCode}")
    public void completeSabotageTask(String payload, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);

        ArrayList<Interactible> updatedSabotageTasks = sabotageService.completeSabotageTask(payload,
                room.getSabotageTasks());
        room.setSabotageTasks(updatedSabotageTasks);
        room.broadCastSabotageTasksUpdate(messagingTemplate);
    }

    @MessageMapping("/enableSabotage/{roomCode}")
    public void enableSabotage(String sabotageName, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        ArrayList<Sabotage> sabotages = room.getSabotages();
        boolean inProgress = false;
        for (Sabotage sabotage : sabotages) {
            if (sabotage.getInProgress()) {
                inProgress = true;
            }
        }
        if (!inProgress) {
            for (Sabotage sab : sabotages) {
                if (sab.getName().equals(sabotageName)) {
                    System.out.println("Enabling Sabotage: " + sab.getName());
                    ArrayList<Interactible> updatedInteractibles = sabotageService
                            .enableSabotageTasks(room.getSabotageTasks(), sab);
                    room.setSabotageTasks(updatedInteractibles);
                    sab.setInProgress(true);
                }
            }
        }
        room.setSabotages(sabotages);
        room.broadCastSabotageTasksUpdate(messagingTemplate);
    }

    @MessageMapping("/wait/{roomCode}")
    public void waitForContinue(String payload, @DestinationVariable String roomCode) {
        // Retrieve the room using the roomCode
        Room room = activeRooms.get(roomCode);

        // Retrieve the player from the room's players map using the payload (player
        // name or identifier)
        Player player = room.getPlayersMap().get(payload);

        // Set the player's willContinue property to true
        player.setWillContinue(true);

        // Broadcast the updated player information to all players in the room
        room.broadcastPlayerUpdate(messagingTemplate);
    }

    @MessageMapping("/startGame/{roomCode}")
    @SendTo("/topic/gameStart/{roomCode}")
    public String startGame(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        System.out.println("Game started!");

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

        room.setSabotages(sabotageService.createSabotages());
        room.setSabotageTasks(sabotageService.createSabotageTasks(room.getSabotages()));

        room.setInteractibles(taskService.createTasks(room.getPlayersMap()));

        room.setGameState("Game running");
        String destination = "/topic/finishGame/" + room.getRoomCode();
        messagingTemplate.convertAndSend(destination, room.getGameStarted());

        room.broadcastPlayerUpdate(messagingTemplate);
        room.broadcastInteractiblesUpdate(messagingTemplate);
        return "Game has started";
    }

    @MessageMapping("/resetLobby/{roomCode}")
    public void resetLobby(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        System.out.println("Resetting Lobby...");

        List<Position> positions = new ArrayList<>();
        positions.add(new Position(900, 500));
        positions.add(new Position(1000, 600));
        positions.add(new Position(1100, 600));
        positions.add(new Position(900, 500));

        int index = 0;
        for (Map.Entry<String, Player> entry : room.getPlayersMap().entrySet()) {
            if (entry.getValue() instanceof Imposter) {
                Player resetImposter = new Player((Imposter) entry.getValue());
                resetImposter.setAlive(true);
                resetImposter.setWillContinue(false);
                resetImposter.setPosition(positions.get(index));
                room.getInGamePlayersMap().put(entry.getKey(), resetImposter);
            } else {
                entry.getValue().setPosition(positions.get(index));
                entry.getValue().setAlive(true);
                entry.getValue().setCanInteract(false);
                entry.getValue().setWillContinue(false);
                room.getInGamePlayersMap().put(entry.getKey(), entry.getValue());
            }
            index++;
            if (index > 3) {
                index = 0;
            }
        }
        room.getPlayersMap().clear();
        room.getInteractibles().clear();
        room.getChatMessages().clear();
        room.getSabotageTasks().clear();
        room.setGameState("Game waiting");

        room.broadcastInteractiblesUpdate(messagingTemplate);
        room.broadCastSabotageTasksUpdate(messagingTemplate);
        room.broadcastPlayerUpdate(messagingTemplate);
    }

    @MessageMapping("/emergencyMeeting/{roomCode}")
    public void emergencyMeeting(String playerName, @DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        room.removeAllDeadBodies();
        room.broadcastInteractiblesUpdate(messagingTemplate);
        emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), roomCode);
        messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
    }

    @MessageMapping("/vote/{roomCode}")
    public void handleVote(String payload, @DestinationVariable String roomCode) {
        // Assuming payload contains playerName and votedPlayer separated by a comma
        Room room = activeRooms.get(roomCode);
        String[] parts = payload.split(",");
        System.out.println("parts lenght: " + parts.length);
        System.out.println("payload: " + payload);
        if (parts.length == 3) {
            String playerName = parts[0].trim();
            String votedPlayer = parts[1].trim();
            String vote = parts[2].trim();
            emergencyMeeting.handleVoting(playerName, votedPlayer, vote, room.getPlayersMap(), roomCode);
        }
    }

    @MessageMapping("/voteTimout/{roomCode}")
    public void handleVoteTimout(@DestinationVariable String roomCode) {
        Room room = activeRooms.get(roomCode);
        emergencyMeeting.submitVotes(room.getPlayersMap(), roomCode);
    }

    /*
     * @EventListener
     * public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
     * String sessionId = event.getSessionId();
     * 
     * boolean isFirstPlayer = false;
     * String firstPlayerName = "";
     * /*
     * CHANGE THIS LOGIC:
     * When player disconnects, fetch correct room, check which player, BEFORE
     * removing player from the list, check whether they are host
     * If they are, remove them and then call the validateHost function on the room,
     * if they are not, only remove them.
     */
    /*
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
