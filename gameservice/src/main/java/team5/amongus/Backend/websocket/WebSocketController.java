package team5.amongus.Backend.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import org.springframework.context.event.EventListener;

import team5.amongus.Backend.model.*;
import team5.amongus.Backend.service.ICollisionMaskService;
import team5.amongus.Backend.service.IPlayerService;
import team5.amongus.Backend.service.ISabotageService;
import team5.amongus.Backend.service.ITaskService;
import team5.amongus.Backend.service.IEmergencyMeetingService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

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
    private Set<String> usedRoomCodes = new HashSet<>();
    private final IEmergencyMeetingService emergencyMeetingService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, IPlayerService playerService,
            ITaskService taskService, ICollisionMaskService collisionMaskService, ISabotageService sabotageService, IEmergencyMeetingService emergencyMeetingService) {
        this.playerService = playerService;
        this.taskService = taskService;
        this.sabotageService = sabotageService;
        this.messagingTemplate = messagingTemplate;
        this.collisionMaskService = collisionMaskService;
        this.collisionMaskLobby = this.collisionMaskService.loadCollisionMask("/LobbyBG_borders.png");
        this.collisionMaskGame = this.collisionMaskService.loadCollisionMask("/spaceShipBG_borders.png");
        this.emergencyMeetingService = emergencyMeetingService;
    }

    @MessageMapping("/hostGame")
    public void hostGame(@Payload HostGameRequest request, SimpMessageHeaderAccessor headerAccessor) {
        String roomCode;
        Room room;
        String sessionId = headerAccessor.getSessionId();

        // Generate a unique room code
        synchronized (usedRoomCodes) {
            do {
                room = new Room(request.getPlayerCount(), request.getPlayerName());
                roomCode = room.getRoomCode();
            } while (!usedRoomCodes.add(roomCode)); // Add the code to the set
        }

        Position position = new Position(900, 500);
        activeRooms.put(roomCode, room);
        Player host = new Player(request.getPlayerName(), position, sessionId);
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
    public void joinGame(@Payload JoinGameRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = headerAccessor.getSessionId();

        if (activeRooms.get(request.getRoomCode()) != null) {
            Room room = activeRooms.get(request.getRoomCode());
            Position position = new Position(900, 500);
            if (room.getInGamePlayersMap().get(request.getPlayerName()) == null) {
                if (room.getInGamePlayersMap().size() < room.getMaxPlayers()) {
                    Player newPlayer = new Player(request.getPlayerName(), position, sessionId);
                    room.addPlayer(newPlayer);
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
                String meeting = "deadbody";
                emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), room.getEmergencyMeeting(), roomCode, meeting);
                messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
            } else if (interactableObject instanceof EmergencyMeeting && player.getisAlive()) {
                String meeting = "button";
                emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), room.getEmergencyMeeting(), roomCode, meeting);
                messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
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
        room.addMeetingToInteractibles();

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
        String meeting = "";
        emergencyMeetingService.handleEmergencyMeeting(playerName, room.getPlayersMap(), room.getEmergencyMeeting(), roomCode, meeting);
        messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
    }

    @MessageMapping("/vote/{roomCode}")
    public void handleVote(String payload, @DestinationVariable String roomCode) {
        // Assuming payload contains playerName and votedPlayer separated by a comma
        Room room = activeRooms.get(roomCode);
        String[] parts = payload.split(",");
        System.out.println("parts lenght: " + parts.length);
        System.out.println("payload: " + payload);
        if (parts.length == 2) {
            String playerName = parts[0].trim();
            String votedPlayer = parts[1].trim();
            emergencyMeetingService.handleVoting(playerName, votedPlayer, room.getPlayersMap(), room.getEmergencyMeeting(), roomCode);
        } else if (parts.length == 1) {
            String playerName = parts[0].trim();
            emergencyMeetingService.handleVoting(playerName, "", room.getPlayersMap(), room.getEmergencyMeeting(), roomCode);            
        }
        if (room.getEmergencyMeeting().getEjectedPlayer() != null) {
            messagingTemplate.convertAndSend("/topic/ejectedPlayer/" + roomCode, room.getEmergencyMeeting().getEjectedPlayer());
        }
        room.broadcastPlayerUpdate(messagingTemplate);
        room.broadcastInteractiblesUpdate(messagingTemplate);
    }

    @MessageMapping("/voteTimeout/{roomCode}")
    public void handleVoteTimout(@DestinationVariable String roomCode) {
        System.out.println("votetimeout");
        Room room = activeRooms.get(roomCode);
        emergencyMeetingService.submitVotes(room.getPlayersMap(), room.getEmergencyMeeting(), roomCode);

        if (room.getEmergencyMeeting().getEjectedPlayer() != null) {
            messagingTemplate.convertAndSend("/topic/ejectedPlayer/" + roomCode, room.getEmergencyMeeting().getEjectedPlayer());
        }
        room.broadcastPlayerUpdate(messagingTemplate);
        room.broadcastInteractiblesUpdate(messagingTemplate);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        System.out.println("Session Disconnect, searching for player");

        // Iterate through active rooms to find the player and room
        for (Iterator<Map.Entry<String, Room>> roomIterator = activeRooms.entrySet().iterator(); roomIterator
                .hasNext();) {
            Map.Entry<String, Room> roomEntry = roomIterator.next();
            Room room = roomEntry.getValue();
            String roomCode = roomEntry.getKey();

            Player playerToRemove = null;
            if (room.getGameStarted().equals("Game waiting")) {
                for (Player player : room.getInGamePlayersMap().values()) {
                    if (Objects.equals(player.getSessionId(), sessionId)) {
                        playerToRemove = player;
                        System.out.println("Found Player");
                        break;
                    }
                }
            } else {
                for (Player player : room.getPlayersMap().values()) {
                    if (Objects.equals(player.getSessionId(), sessionId)) {
                        playerToRemove = player;
                        System.out.println("Found Player");
                        break;
                    }
                }
            }

            if (playerToRemove != null) {
                // Remove the player from the room
                room.removePlayer(playerToRemove.getName());

                // Check if the player was the host
                if (playerToRemove.getIsHost()) {
                    System.out.println("Host left, reassigning Host");
                    room.validateHost();
                }

                // If the room is now empty, remove it from active rooms
                if (room.getPlayersMap().isEmpty()&&room.getInGamePlayersMap().isEmpty()) {
                    roomIterator.remove();
                    usedRoomCodes.remove(roomCode);
                    System.out.println("[Websocket Controller] Room " + roomCode + " has been removed as it is now empty.");
                }

                // Broadcast the updated player list to the room
                room.broadcastPlayerUpdate(messagingTemplate);
                break; // Exit the loop as we found and handled the player
            }
        }
    }

}
