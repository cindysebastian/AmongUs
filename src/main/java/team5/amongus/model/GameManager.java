package team5.amongus.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Component;

@Component
public class GameManager {
    private final List<Player> playersMap = new ArrayList<>();
    private final List<Imposter> imposters = new ArrayList<>();

    public List<Imposter> getImposters() {
        return imposters;
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
            imposters.add(imposter);
            player.setImposter(true);
            System.out.println("Imposter: " + imposter.getName());
        } else {
            System.out.println("No players available to become the imposter.");
        }
        
        return getImposters();
    }

}