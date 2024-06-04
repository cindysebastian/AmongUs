package team5.amongus.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import team5.amongus.service.GameWinningService;
import team5.amongus.service.IGameWinningService;

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
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private List<Message> chatMessages = new ArrayList<>();
    private String gameState = "stopped";
    String result = "";

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

    public List<Message> getChatMessages() {
        return chatMessages;
    }

    public void setMessages(List<Message> chatMessages) {
        this.chatMessages = chatMessages;
    }

    public ArrayList<Interactible> getInteractibles() {
        return interactibles;
    }

    public void setGameState(String gameStarted) {
        this.gameState = gameStarted;
    }

    public void addPlayer(Player player) {
        inGamePlayersMap.put(player.getName(), player);
        System.out.println(inGamePlayersMap);
    }

    public void removeLobbyPlayer(String playerName) {
        inGamePlayersMap.remove(playerName);
    }

    public void removePlayer(String playerName) {
        playersMap.remove(playerName);
    }

    public String getGameStarted() {
        return gameState;
    }

    public void setSabotages(ArrayList<Sabotage> sabotages){
        this.sabotages = sabotages;
    }

    public ArrayList<Sabotage> getSabotages(){
        return sabotages;
    }

    public void setSabotageTasks(ArrayList<Interactible> sabotageTasks){
        this.sabotageTasks = sabotageTasks;
    }

    public ArrayList<Interactible> getSabotageTasks(){
        return sabotageTasks;
    }

    /*public String validateHost() {
        boolean hostConnected = false;
        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            String key = entry.getKey();

            if (key.equals(this.host)) {
                hostConnected = true;
                break;
            }
        }
        if (hostConnected) {
            return this.host;
        } else {
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                String key = entry.getKey();
                Player player = entry.getValue();
                this.host = key;
                player.setIsHost(true);
                break;
            }
            System.out.println("[Room.java] Host changed! New host: " + this.host);
            return this.host;
        }
    }*/

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
            Imposter imposter = new Imposter(player.getName(), player.getPosition());
            if(player.getIsHost()){
                imposter.setIsHost(true);
            }
            playersMap.put(imposter.getName(), imposter);

            System.out.println("Imposter: " + imposter.getName());

        } else {
            System.out.println("No players available to become the imposter.");
        }

        return playersMap;
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
        if (player1.getWillContinue() != player2.getWillContinue()) {
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
            }
        }
        // Check if the result has changed
        if (!result.equals(this.gameState)) {
            // Send the message only if the result has changed
            String destination = "/topic/finishGame/" + this.roomCode;
            messagingTemplate.convertAndSend(destination, this.gameState);
            result= this.gameState; // Update the previousResult variable
            System.out.println("Game State changed to: " + gameState);
        }

        return result;
    }

}
