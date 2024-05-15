// TaskServiceImpl.java
package team5.amongus.service;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Task;

import java.util.ArrayList;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class TaskService implements ITaskService {




    @Override
    public ArrayList<Interactible> updateTaskInteractions(Map<String, Player> playersMap,
            ArrayList<Interactible> interactibles,
            Player player,
            Task task) {
        // Logic for updating tasks and sending them to the endpoint



        // Check whether the player is allowed to interact with the Task
        

        if (interactibles.contains(task) && player.collidesWith(task)
                && task.getAssignedPlayer().equals(player.getName())) {
                    
            for (Interactible currentObj : interactibles) {
                if (currentObj instanceof Task) {
                    
                    if (currentObj.equals(task)) {
                        
                        task.setInProgress(true);
                        ((Task) currentObj).setInProgress(true);
                    }
                }
            }

            System.out.println("Updated task information sent successfully.");
        }
        return interactibles;
    }
}
