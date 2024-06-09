package team5.amongus.service;
import java.util.ArrayList;
import java.util.Map;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Sabotage;



public interface IGameWinningService {

    public boolean allTasksCompleted(ArrayList<Interactible> interactibles);
    
    public boolean imposterDead(Map<String, Player> playersMap);

    public boolean enoughCrewmatesDead(Map<String, Player> playersMap);

    public boolean sabotageWin(ArrayList<Sabotage> sabotages);
    
}