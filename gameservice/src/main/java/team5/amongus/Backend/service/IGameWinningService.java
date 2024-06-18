package team5.amongus.Backend.service;
import java.util.ArrayList;
import java.util.Map;

import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Sabotage;



public interface IGameWinningService {

    public boolean allTasksCompleted(ArrayList<Interactible> interactibles);
    
    public boolean imposterDead(Map<String, Player> playersMap);

    public boolean enoughCrewmatesDead(Map<String, Player> playersMap);

    public boolean sabotageWin(ArrayList<Sabotage> sabotages);
    
}