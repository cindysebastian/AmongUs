package team5.amongus.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Position;
import team5.amongus.model.Sabotage;
import team5.amongus.model.SabotageTask;

@Service
public class SabotageService implements ISabotageService {
    private final ObjectMapper objectMapper;

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
                        System.out.println("SabotageTask in progress: " + ((SabotageTask) obj).getId());
                    } else {
                        System.out.println("There is no sabotage going on.");
                    }
                }
            }
        }
        return interactibles;
    }

    @Override
    public ArrayList<Interactible> enableSabotageTasks(ArrayList<Interactible> interactibles, Sabotage sabotage) {
        boolean inProgress = false;
        for (Interactible interactible : interactibles) {
            if (((SabotageTask)interactible).getSabotage().getInProgress()) {
                inProgress = true;
                System.out.println("Sabotage already in progress!");
            }
        }
        
        if (!inProgress) {
            for (Interactible sab : interactibles) {
                if (sab instanceof SabotageTask && (((SabotageTask)sab).getSabotage()).equals(sabotage)) {
                    System.out.println("Activating Sabotage");
                    SabotageTask task = (SabotageTask) sab;
                    task.getSabotage().setInProgress(true);
                    task.setCompleted(false);
                }  
            }
        }
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
}
