package team5.amongus.Backend.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import team5.amongus.Backend.service.EmergencyMeetingService;
import team5.amongus.Backend.service.GameWinningService;
import team5.amongus.Backend.service.IGameWinningService;
import team5.amongus.Backend.service.SabotageService;

public class Room {
    private final String roomCode;
    private final int maxPlayers;
    private String host;
    private final Map<String, Player> playersMap = new HashMap<>();
    private final Map<String, Player> previousPlayersMap = new HashMap<>();
    private final Map<String, Player> previousinGamePlayersMap = new HashMap<>();
    private ArrayList<Interactible> interactibles = new ArrayList<>();
    private ArrayList<Interactible> sabotageTasks = new ArrayList<>();
    private ArrayList<Sabotage> sabotages = new ArrayList<>();
    private ArrayList<Interactible> previousInteractibles = new ArrayList<>();
    private ArrayList<Interactible> previousSabotageTasks = new ArrayList<>();
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private String gameState = "stopped";
    String result = "";
    private EmergencyMeeting emergencyMeeting = new EmergencyMeeting();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public Room(int maxPlayers, String host) {
        this.roomCode = generateRoomCode();
        this.maxPlayers = maxPlayers;
        this.host = host;
        this.gameState = "Game waiting";
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public Map<String, Player> getPlayersMap() {
        return playersMap;
    }

    public Map<String, Player> getInGamePlayersMap() {
        return inGamePlayersMap;
    }

    public ArrayList<Interactible> getInteractibles() {
        return interactibles;
    }

    public void setGameState(String gameStarted) {
        this.gameState = gameStarted;
    }

    public void addPlayer(Player player) {
        inGamePlayersMap.put(player.getName(), player);
        System.out.println("[Room.java] " + inGamePlayersMap);
    }

    public void removeLobbyPlayer(String playerName) {
        inGamePlayersMap.remove(playerName);
    }

    public void removePlayer(String playerName, SimpMessagingTemplate msg) {
        for (Iterator<Interactible> iterator = interactibles.iterator(); iterator.hasNext();) {
            Interactible interactible = iterator.next();
            if(interactible instanceof Task){
                Task task = (Task) interactible;
                if (task.getAssignedPlayer().equals(playerName)) {
                    iterator.remove();
                    System.out.println("Removing task");
                }
            }
            
            
        }
        playersMap.remove(playerName);
        inGamePlayersMap.remove(playerName);
        broadcastInteractiblesUpdate(msg);
    }

    public String getGameStarted() {
        return gameState;
    }

    public void setSabotages(ArrayList<Sabotage> sabotages) {
        this.sabotages = sabotages;
    }

    public ArrayList<Sabotage> getSabotages() {
        return sabotages;
    }

    public void setSabotageTasks(ArrayList<Interactible> sabotageTasks) {
        this.sabotageTasks = sabotageTasks;
    }

    public ArrayList<Interactible> getSabotageTasks() {
        return sabotageTasks;
    }

    public void setEmergencyMeeting(EmergencyMeeting emergencyMeeting) {
        this.emergencyMeeting = emergencyMeeting;
    }

    public EmergencyMeeting getEmergencyMeeting() {
        return emergencyMeeting;
    }

    public String validateHost() {
        boolean hostConnected = false;
        if (gameState.equals("Game waiting")) {
            for (Map.Entry<String, Player> entry : inGamePlayersMap.entrySet()) {
                String key = entry.getKey();

                if (key.equals(this.host)) {
                    hostConnected = true;
                    break;
                }
            }
        } else {
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                String key = entry.getKey();

                if (key.equals(this.host)) {
                    hostConnected = true;
                    break;
                }
            }
        }

        if (hostConnected) {
            return this.host;
        } else {
            if (gameState.equals("Game waiting")) {
                for (Map.Entry<String, Player> entry : inGamePlayersMap.entrySet()) {
                    String key = entry.getKey();
                    Player player = entry.getValue();
                    this.host = key;
                    player.setIsHost(true);
                    break;
                }
            } else {
                for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                    String key = entry.getKey();
                    Player player = entry.getValue();
                    this.host = key;
                    player.setIsHost(true);
                    break;
                }
            }

            System.out.println("[Room.java] Host changed! New host: " + this.host);
            return this.host;
        }
    }

    private String generateRoomCode() {
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        // Generate 6 characters
        for (int i = 0; i < 6; i++) {
            // Randomly choose between uppercase letters and digits
            int choice = random.nextInt(2);
            if (choice == 0) {
                // Generate a random uppercase letter (A-Z)
                char letter = (char) (random.nextInt(26) + 'A');
                sb.append(letter);
            } else {
                // Generate a random digit (0-9)
                int digit = random.nextInt(10);
                sb.append(digit);
            }
        }

        return sb.toString();
    }

    public Map<String, Player> chooseImposter() {
        Random random = new Random();

        List<String> playerList = new ArrayList<>(playersMap.keySet());

        // Get a random index within the size of the players list
        int randomIndex = random.nextInt(playersMap.size());

        // Retrieve the player object at the random index
        String playerName = playerList.get(randomIndex);

        if (!playerName.isEmpty()) {
            Player player = playersMap.get(playerName);
            Imposter imposter = new Imposter(player.getName(), player.getPosition(), player.getSessionId());
            if (player.getIsHost()) {
                imposter.setIsHost(true);
            }
            playersMap.put(imposter.getName(), imposter);

            

        } else {
            System.out.println("[Room.java] No players available to become the imposter.");
        }

        return playersMap;
    }

    public void forcebroadcastPlayerUpdate(SimpMessagingTemplate messagingTemplate) {
        String destination = "/topic/players/" + roomCode;
        messagingTemplate.convertAndSend(destination, playersMap);
        destination = "/topic/inGamePlayers/" + this.roomCode;
        messagingTemplate.convertAndSend(destination, inGamePlayersMap);
    }

    public void broadcastPlayerUpdate(SimpMessagingTemplate messagingTemplate) {

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

            String destination = "/topic/players/" + roomCode;

            messagingTemplate.convertAndSend(destination, playersMap);
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
            String destination = "/topic/inGamePlayers/" + this.roomCode;

            messagingTemplate.convertAndSend(destination, inGamePlayersMap);

        }
        if (this.gameState.equals("Game running") || this.gameState.equals("Game waiting")) {
            finishGame(messagingTemplate);
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
            if (player2 != null) {
                if (!arePlayersEqual(player1, player2)) {
                    return false;
                }
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
        if (player1.getWillContinue() != player2.getWillContinue()) {
            return false;
        }
        if (player1.getHasVoted() != player2.getHasVoted()) {
            return false;
        }

        return true;
    }

    public void setInteractibles(ArrayList<Interactible> updatedInteractables) {
        interactibles = updatedInteractables;
    }

    public void broadcastInteractiblesUpdate(SimpMessagingTemplate messagingTemplate) {
        List<Interactible> clonedInteractibles = cloneInteractibles(interactibles);
        if (!Objects.equals(clonedInteractibles, previousInteractibles)) {
            messagingTemplate.convertAndSend("/topic/interactions/" + roomCode, clonedInteractibles);
            previousInteractibles.clear();
            previousInteractibles.addAll(clonedInteractibles);
        }
        if (this.gameState.equals("Game running")) {
            finishGame(messagingTemplate);
        }
    }

    public void forcebroadcastInteractiblesUpdate(SimpMessagingTemplate messagingTemplate) {
        messagingTemplate.convertAndSend("/topic/interactions/" + roomCode, interactibles);
    }

    public void broadCastSabotageTasksUpdate(SimpMessagingTemplate messagingTemplate) {
        List<Interactible> clonedSabotageTasks = cloneInteractibles(sabotageTasks);
        if (!Objects.equals(clonedSabotageTasks, previousSabotageTasks)) {
            messagingTemplate.convertAndSend("/topic/sabotages/" + roomCode, clonedSabotageTasks);
            previousSabotageTasks.clear();
            previousSabotageTasks.addAll(clonedSabotageTasks);
        }
        if (this.gameState.equals("Game running")) {
            finishGame(messagingTemplate);
        }
    }

    private List<Interactible> cloneInteractibles(List<Interactible> original) {
        List<Interactible> clonedList = new ArrayList<>(original.size());
        for (Interactible interactible : original) {
            clonedList.add(interactible.clone());
        }
        return clonedList;
    }

    public String finishGame(SimpMessagingTemplate messagingTemplate) {
        final IGameWinningService gameWinningService = new GameWinningService();

        if (this.gameState.equals("Game running")) {
            if (gameWinningService.allTasksCompleted(this.interactibles)) {
                this.gameState = "Crewmates win";
            } else if (gameWinningService.enoughCrewmatesDead(this.playersMap)) {
                this.gameState = "Imposter wins";
            } else if (gameWinningService.imposterDead(this.playersMap)) {
                this.gameState = "Crewmates win";
            } else if (gameWinningService.sabotageWin(this.sabotages)) {
                this.gameState = "Imposter wins";
            }
        }
        // Check if the result has changed
        if (!result.equals(this.gameState)) {
            // Send the message only if the result has changed
            String destination = "/topic/finishGame/" + this.roomCode;
            messagingTemplate.convertAndSend(destination, this.gameState);
            result = this.gameState; // Update the previousResult variable
        }

        return result;
    }

    public void removeAllDeadBodies() {
        Iterator<Interactible> iterator = this.interactibles.iterator();
        while (iterator.hasNext()) {
            Interactible interactible = iterator.next();
            if (interactible instanceof DeadBody) {
                iterator.remove(); // Safe removal using iterator
            }
        }
    }

    public void addMeetingToInteractibles() {
        interactibles.add(emergencyMeeting);
    }

    public void startCooldown(EmergencyMeeting emergencyMeeting, SimpMessagingTemplate messagingTemplate) {
        emergencyMeeting.setIsCooldownActive(true);
        scheduler.schedule(() -> {
            emergencyMeeting.setIsCooldownActive(false);

            forcebroadcastInteractiblesUpdate(messagingTemplate);
        }, 120, TimeUnit.SECONDS); // 120 seconds cooldown
    }

    public void startEjectGifCountdown(EmergencyMeeting emergencyMeeting, SimpMessagingTemplate msg) {
        scheduler.schedule(() -> {
            emergencyMeeting.setInMeeting(false);

            getEmergencyMeeting().setFinalising(false);
            forcebroadcastInteractiblesUpdate(msg);
        }, 5, TimeUnit.SECONDS);
    }

    public void startMeetingCountdown(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting,
            SimpMessagingTemplate msg, EmergencyMeetingService emService) {
        scheduler.schedule(() -> {
            if (emergencyMeeting.getInMeeting()) {
                emService.submitVotes(playersMap, emergencyMeeting, this, msg);
            }

        }, 30, TimeUnit.SECONDS);
    }
 
    public void startHandleLethalSabotageTimer(ArrayList<Interactible> interactibles, Room room,
            SabotageService sabService) {
        scheduler.schedule(() -> {
            sabService.handleSabotageTimerExpiry(interactibles);
        }, 30, TimeUnit.SECONDS);
    }

    public void removeTasksOfDisconnectedPlayer(Player player){
        for (Interactible interactible : interactibles) {
            if (interactible instanceof Task) {
                if (((Task) interactible).getAssignedPlayer().equals(player.getName())) {
                    interactibles.remove(interactible);
                }
            }
        }
    }
}
