package team5.amongus.Backend.service;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Sabotage;
import team5.amongus.Backend.model.SabotageTask;

@Service
public class SabotageService implements ISabotageService {
    private final ObjectMapper objectMapper;
    private List<Interactible> interactibles = new ArrayList<>();

    public SabotageService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public ArrayList<Sabotage> createSabotages(){
        Sabotage endGameSabotage = new Sabotage("EndGameSabotage");
        Sabotage annoySabotage = new Sabotage("AnnoySabotage");
        ArrayList<Sabotage> sabotages = new ArrayList<>();
        sabotages.add(endGameSabotage);
        sabotages.add(annoySabotage);
        return sabotages;
    }

    @Override
    public ArrayList<Interactible> createSabotageTasks(ArrayList<Sabotage> sabotages) {
        ArrayList<Interactible> interactibles = new ArrayList<>();

        SabotageTask endGameSabTask = new SabotageTask(400, 1000, sabotages.get(0));
        endGameSabTask.setId(50);
        interactibles.add(endGameSabTask);
        SabotageTask annoySabTask = new SabotageTask(3750, 1000, sabotages.get(1));
        annoySabTask.setId(51);
        interactibles.add(annoySabTask);
        System.out.println(interactibles);
        this.interactibles = interactibles;

        return interactibles;
    }

    @Override
    public ArrayList<Interactible> updateSabotageTaskInteractions(ArrayList<Interactible> interactibles, Player player, SabotageTask task){
        if (interactibles.contains(task) && player.collidesWith(task)) {
            for(Interactible obj : interactibles){
                if (obj.equals(task)) {
                    if (!((SabotageTask) obj).getCompleted()) {
                        task.setInProgress(true);
                        ((SabotageTask) obj).setInProgress(true);
                        ((SabotageTask) obj).setTriggeredBy(player.getName());
                        System.out.println("SabotageTask in progress: " + ((SabotageTask) obj).getId() + ", triggered by " + player.getName());
                    } else {
                        System.out.println("There is no sabotage going on.");
                    }
                }
            }
        }
        this.interactibles = interactibles;
        return interactibles;
    }

    @Override
    public ArrayList<Interactible> enableSabotageTasks(ArrayList<Interactible> interactibles, Sabotage sabotage) {
        boolean inProgress = false;
        for (Interactible interactible : interactibles) {
            if (((SabotageTask) interactible).getSabotage().getInProgress()) {
                inProgress = true;
                System.out.println("Sabotage already in progress!");
            }
        }
        
        if (!inProgress) {
            for (Interactible sab : interactibles) {
                if (sab instanceof SabotageTask && ((SabotageTask) sab).getSabotage().equals(sabotage)) {
                    System.out.println("Activating Sabotage");
                    SabotageTask task = (SabotageTask) sab;
                    task.getSabotage().setInProgress(true);
                    task.setCompleted(false);
                }  
            }
        }
        this.interactibles = interactibles;
        ScheduledExecutorService executerService = Executors.newSingleThreadScheduledExecutor();
        executerService.schedule(new Runnable(){
            @Override
            public void run(){
                handleSabotageTimerExpiry(interactibles);
            }}, 30, TimeUnit.SECONDS);
        return interactibles;
    }

    @Override
    public ArrayList<Interactible> completeSabotageTask(String payload, ArrayList<Interactible> interactibles) {
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            int interactibleId = jsonNode.get("interactibleId").asInt();

            Interactible interactiblesToUpdate = Interactible.getInteractibleById(interactibleId, interactibles);
            if (interactiblesToUpdate != null && interactiblesToUpdate instanceof SabotageTask) {
                SabotageTask task = (SabotageTask) interactiblesToUpdate;
                if (task.getInProgress()) {
                    task.setCompleted(true);
                    task.setInProgress(false);
                    task.getSabotage().setInProgress(false);

                    return interactibles;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return interactibles;
    }    

    // Method to check if the sabotage timer has expired
    public boolean isSabotageTimerExpired(Sabotage sabotage) {
        if (sabotage.getInProgress() && sabotage.getName().equals("EndGameSabotage")) {
            LocalDateTime activationTime = sabotage.getActivationTime();
            if (activationTime != null) {
                LocalDateTime currentTime = LocalDateTime.now();
                Duration duration = Duration.between(activationTime, currentTime);
                // Check if 30 seconds have passed
                return duration.getSeconds() >= 30;
            }
        }
        return false;
    }

    // Method to handle ending the game if the sabotage timer expires
    public void handleSabotageTimerExpiry(List<Interactible> interactibles /* , List<Player> players*/) {
        Sabotage endGameSabotage = null;
        for (Interactible interactible : interactibles) {
            if (interactible instanceof SabotageTask && 
                (((SabotageTask)interactible).getSabotage()).getName().equals("EndGameSabotage") && 
                ((SabotageTask) interactible).getSabotage().getInProgress()) 
                {
                endGameSabotage = ((SabotageTask) interactible).getSabotage();
                break;
            }
        }
        if (endGameSabotage != null && isSabotageTimerExpired(endGameSabotage)) {
            System.out.println("Game end because of sabotage");
            endGameSabotage.setGameEnd(true);
        }
    }
}
