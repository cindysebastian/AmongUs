package team5.amongus.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;


public class Room {
    private final String roomCode;
    private final Map<String, Player> playersMap = new HashMap<>();
    private final Map<String, Player> previousPlayersMap = new HashMap<>();
    private final Map<String, Player> previousinGamePlayersMap = new HashMap<>();
    private ArrayList<Interactible> interactibles = new ArrayList<>();
    private ArrayList<Interactible> previousInteractibles = new ArrayList<>();
    private final Map<String, Player> inGamePlayersMap = new HashMap<>();
    private List<Message> chatMessages = new ArrayList<>();
    private boolean gameStarted = false;


    public Room() {
        this.roomCode = generateRoomCode();
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

    public void setMessages(List<Message> chatMessages){
        this.chatMessages = chatMessages;
    }

    public ArrayList<Interactible> getInteractibles() {
        return interactibles;
    }

    public void setGameStarted(boolean gameStarted) {
        this.gameStarted = gameStarted;
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

    public boolean getGameStarted(){
        return gameStarted;
    }

    private String generateRoomCode() {
        // Implement your room code generation logic here
        return "12345"; // Placeholder
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
            playersMap.put(imposter.getName(), imposter);

            System.out.println("Imposter: " + imposter.getName());

        } else {
            System.out.println("No players available to become the imposter.");
        }

        return playersMap;
    }


    


    public void broadcastPlayerUpdate(SimpMessagingTemplate messagingTemplate) {
        

        // Update the last broadcast time
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
            String destination = "/topic/inGamePlayers/" + roomCode;

            messagingTemplate.convertAndSend(destination, inGamePlayersMap);

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

    public void setInteractibles(ArrayList<Interactible> updatedInteractables) {
        interactibles = updatedInteractables;
    }

    public void broadcastInteractiblesUpdate(SimpMessagingTemplate messagingTemplate) {
        if (!Objects.equals(interactibles, previousInteractibles)) {
            messagingTemplate.convertAndSend("/{roomcode}/topic/interactions", interactibles);
            previousInteractibles.clear();
            previousInteractibles.addAll(interactibles);
        }
    }

}
