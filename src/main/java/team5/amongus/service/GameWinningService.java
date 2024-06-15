package team5.amongus.service;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Service;

import team5.amongus.model.Imposter;
import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Sabotage;
import team5.amongus.model.Task;

@Service
public class GameWinningService implements IGameWinningService {
    boolean allTasksCompleted = false;
    boolean imposterDead = false;
    boolean sabotageWin = false;

    @Override
    public boolean allTasksCompleted(ArrayList<Interactible> interactibles) {

        for (Interactible interactible : interactibles) {
            if (interactible instanceof Task) {
                if (((Task) interactible).getTaskCompleted()) {
                    allTasksCompleted = true;
                    continue;
                } else {
                    allTasksCompleted = false;
                    break;
                }
            }

        }
        return allTasksCompleted;
    }

    public boolean imposterDead(Map<String, Player> playersMap) {
        boolean imposterExists = false;
    
        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
    
            // Check if the player is an imposter
            if (player instanceof Imposter) {
                imposterExists = true;
    
                // Check if the imposter is dead
                if (!player.getisAlive()) {
                    return true; // Imposter is found and dead
                }
            }
        }
    
        // If no imposter object is found, return true to indicate crewmates win
        return !imposterExists;
    }
    

    @Override
    public boolean enoughCrewmatesDead(Map<String, Player> playersMap) {

        int imposterCount = 0;
        int playercount = 0;


        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            if (player instanceof Imposter && player.getisAlive()) {
                imposterCount++;
            }else if(player.getisAlive()){
                playercount++;
            }
        }
        
        return playercount <= imposterCount;
    }

    public boolean sabotageWin(ArrayList<Sabotage> sabotages){
        for (Sabotage sab : sabotages) {
            if (sab.getGameEnd()) {
                sabotageWin = true;
            }
        }
        return sabotageWin;
    }

}
