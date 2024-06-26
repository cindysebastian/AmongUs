package team5.amongus.Backend.service;

import java.util.ArrayList;

import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Room;
import team5.amongus.Backend.model.Sabotage;
import team5.amongus.Backend.model.SabotageTask;

public interface ISabotageService {
    public ArrayList<Sabotage> createSabotages();

    public ArrayList<Interactible> createSabotageTasks(ArrayList<Sabotage> sabotages);

    public ArrayList<Interactible> updateSabotageTaskInteractions(ArrayList<Interactible> interactibles, Player player, SabotageTask task);
    
    public ArrayList<Interactible> enableSabotageTasks(ArrayList<Interactible> interactibles, Sabotage sabotage, Room room);

    public ArrayList<Interactible> completeSabotageTask(String payload, ArrayList<Interactible> interactibles);
}
