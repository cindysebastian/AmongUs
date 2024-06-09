package team5.amongus.service;

import java.util.ArrayList;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Sabotage;
import team5.amongus.model.SabotageTask;

public interface ISabotageService {
    public ArrayList<Sabotage> createSabotages();

    public ArrayList<Interactible> createSabotageTasks(ArrayList<Sabotage> sabotages);

    public ArrayList<Interactible> updateSabotageTaskInteractions(ArrayList<Interactible> interactibles, Player player, SabotageTask task);
    
    public ArrayList<Interactible> enableSabotageTasks(ArrayList<Interactible> interactibles, Sabotage sabotage);

    public ArrayList<Interactible> completeSabotageTask(String payload, ArrayList<Interactible> interactibles);
}
