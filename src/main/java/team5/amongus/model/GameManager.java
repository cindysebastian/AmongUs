package team5.amongus.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Component;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Component
public class GameManager {

    private SimpMessagingTemplate messagingTemplate = null;

    public GameManager(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public Map<String, Player> chooseImposter(Map<String, Player> playersMap) {
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

    public void notifyPlayerKilled(Player killedPlayer) {
        messagingTemplate.convertAndSend("/topic/killedPlayer", killedPlayer);
    }

    // should inform player he is imposter for KillButton
    public void notifyPlayerisImposter(Player imposter) {
        messagingTemplate.convertAndSend("/topic/isImposter", imposter);
    }

    public void handleEmergencyMeeting(Player playerName) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting", playerName);
    }

}