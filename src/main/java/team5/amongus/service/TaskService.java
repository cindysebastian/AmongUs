// TaskServiceImpl.java
package team5.amongus.service;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Position;
import team5.amongus.model.Task;
import team5.amongus.model.TaskType;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class TaskService implements ITaskService {
    private final ObjectMapper objectMapper;

    public TaskService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public ArrayList<Interactible> createTasks(Map<String, Player> playersMap) {
        ArrayList<Interactible> interactibles = new ArrayList<>();
        TaskType[] taskTypes = TaskType.values();
        Map<TaskType, List<Position>> taskPositions = new HashMap<>(); // Map to store task positions by type

        Random random = new Random();
        int taskIdCounter = 1; // Counter for generating unique task IDs

        for (Player player : playersMap.values()) {
            // Generate a random index to get a random type of Task
            TaskType type = taskTypes[random.nextInt(taskTypes.length)];

            // Generate Positions based on Task Type
            Position position = generateUniquePosition(type, taskPositions);

            // Set the Task with a unique ID
            Task task = new Task(type, position.getX(), position.getY(), player.getName());
            task.setId(taskIdCounter++); // Assign a unique ID
            interactibles.add(task);
        }
        return interactibles;
    }

    // Method to generate a unique position for the task based on its type
    private Position generateUniquePosition(TaskType type, Map<TaskType, List<Position>> taskPositions) {
        Random random = new Random();
        List<Position> positions = taskPositions.getOrDefault(type, new ArrayList<>());

        int posX;
        int posY;

        do {
            // Generate random positions
            posX = random.nextInt(1000); // Adjust the range according to your requirements
            posY = random.nextInt(1000); // Adjust the range according to your requirements
        } while (positionExists(positions, posX, posY));

        // Add the generated position to the list
        positions.add(new Position(posX, posY));
        taskPositions.put(type, positions);

        return new Position(posX, posY);
    }

    // Method to check if a position already exists for the given task type
    private boolean positionExists(List<Position> positions, int posX, int posY) {
        for (Position position : positions) {
            if (position.getX() == posX && position.getY() == posY) {
                return true;
            }
        }
        return false;
    }

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

    public ArrayList<Interactible> completeTask(String payload, ArrayList<Interactible> interactibles) {
        try {
            for (Interactible task : interactibles) {
                System.out.println(task.toString());
            }
    
            JsonNode jsonNode = objectMapper.readTree(payload);
            int interactibleId = jsonNode.get("interactibleId").asInt();
    
            Interactible interactibleToUpdate = Interactible.getInteractibleById(interactibleId, interactibles);
            if (interactibleToUpdate != null && interactibleToUpdate instanceof Task) {
                Task task = (Task) interactibleToUpdate;
                if (task.getInProgress()) {
                    // Set completed to true and inProgress to false
                    task.setCompleted(true);
                    task.setInProgress(false);
                    // No need to set the interactible back into the list, as it's already a reference
                    return interactibles;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            // Handle JSON parsing exception
        }
        System.out.println("Task Completion Error");
        return interactibles;
    }
    
}
