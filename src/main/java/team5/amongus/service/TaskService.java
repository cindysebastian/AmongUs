// TaskServiceImpl.java
package team5.amongus.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Task;

import java.util.ArrayList;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class TaskService implements ITaskService {

    private final ObjectMapper objectMapper;

    public TaskService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;

    }

    @Override
    public ArrayList<Interactible> updateTaskInteractions(Map<String, Player> playersMap,
            ArrayList<Interactible> interactibles,
            Player player,
            Task task) {
        // Logic for updating tasks and sending them to the endpoint



        // Check whether the player is allowed to interact with the Task
        if (playersMap.containsValue(player) && interactibles.contains(task) && player.collidesWith(task)
                && task.getAssignedPlayer() == player) {
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
