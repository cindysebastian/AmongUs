package team5.amongus.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.stereotype.Component;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Component
public class GameManager {
    private final List<Player> playersMap = new ArrayList<>();
    private final List<Imposter> imposters = new ArrayList<>();
    private SimpMessagingTemplate messagingTemplate = null;

    public GameManager(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public List<Imposter> getImposters() {
        return imposters;
    }

    public List<Player> getPlayers() {
        return playersMap;
    }

    public void addPlayer(Player player) {
        playersMap.add(player);
    }

    public List<Imposter> chooseImposter() {
        imposters.clear();
        if (playersMap.isEmpty()) {
            System.out.println("No players available to become the imposter.");
            return imposters;
        }
        Random random = new Random();

        // Get a random index within the size of the players list
        int randomIndex = random.nextInt(playersMap.size());

        // Retrieve the player object at the random index
        Player player = playersMap.get(randomIndex);

        if (player != null) {
            Imposter imposter = new Imposter(player.getName(), player.getPosition());
            playersMap.add(imposter);
            imposters.add(imposter);
            notifyPlayerisImposter(imposter);
            playersMap.remove(player);
            System.out.println("Imposter: " + imposter.getName());

            // Send the entire Imposter object to the frontend
            messagingTemplate.convertAndSend("/topic/players", playersMap);
            System.out.println(messagingTemplate);
        } else {
            System.out.println("No players available to become the imposter.");
        }

        return getImposters();
    }

    public void notifyPlayerKilled(Player killedPlayer) {
        messagingTemplate.convertAndSend("/topic/killedPlayer", killedPlayer);
    }
    //should inform player he is imposter for KillButton
    public void notifyPlayerisImposter(Player imposter) {
        messagingTemplate.convertAndSend("/topic/isImposter", imposter);
    }

}