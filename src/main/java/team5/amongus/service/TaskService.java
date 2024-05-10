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
import org.springframework.web.client.RestTemplate;

@Service
public class TaskService implements ITaskService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public TaskService(ObjectMapper objectMapper, RestTemplate restTemplate) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
    }

    @Override
    public void updateTaskInteractions(Map<String, Player> playersMap, ArrayList<Interactible> interactibles,
            Player player,
            Task task) {
        // Logic for updating tasks and sending them to the endpoint
        try {

            String taskEndpoint = "/tasks";

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
                // Only send update if changes occured

                String taskJson = objectMapper.writeValueAsString(interactibles);

                restTemplate.postForObject(taskEndpoint, taskJson, String.class);
                System.out.println("Updated task information sent successfully.");
            }

        } catch (

        JsonProcessingException e) {
            e.printStackTrace();
            // Handle JSON processing exception
        } catch (Exception e) {
            e.printStackTrace();
            // Handle other exceptions
        }
    }
}
