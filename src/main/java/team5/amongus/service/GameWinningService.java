package team5.amongus.service;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.stereotype.Service;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;

@Service
public class GameWinningService implements IGameWinningService{

    @Override
    public boolean allTasksCompleted(ArrayList<Interactible> interactibles) {
        return true;
    }

    @Override
    public boolean imposterDead(Map<String, Player> playersMap) {
        return true; 
    }

    @Override
    public boolean enoughCrewmatesDead(Map<String, Player> playersMap) {
        return true; 
    }
    
}
