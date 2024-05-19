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

    private final Map<TaskType, List<Position>> taskPositionsMap = new HashMap<>(); // Map to store task positions by type

    @Override
    public ArrayList<Interactible> createTasks(Map<String, Player> playersMap) {
        ArrayList<Interactible> interactibles = new ArrayList<>();
        TaskType[] taskTypes = TaskType.values();
    
        Random random = new Random();
        int taskIdCounter = 1; // Counter for generating unique task IDs
    
        for (Player player : playersMap.values()) {
            for (int i = 0; i < 5; i++) { // Create five tasks for each player
                // Generate a random index to get a random type of Task
                TaskType type = taskTypes[random.nextInt(taskTypes.length)];
    
                // Generate Positions based on Task Type
                Position position = generateUniquePosition(type);
    
                // Set the Task with a unique ID
                Task task = new Task(type, position.getX(), position.getY(), player.getName());
                task.setId(taskIdCounter++); // Assign a unique ID
                interactibles.add(task);
            }
        }
        return interactibles;
    }

    // Method to generate a unique position for the task based on its type
    private Position generateUniquePosition(TaskType type) {
        Random random = new Random();
        List<Position> positions = taskPositionsMap.getOrDefault(type, new ArrayList<>());

        if (positions.isEmpty()) {
            // Populate the list with predetermined coordinates for the task type
            switch (type) {
                case MINE:
                    populateMinePositions(positions);
                    break;
                case SCAN:
                    populateScanPositions(positions);
                    break;
                case SWIPE:
                    populateSwipePositions(positions);
                    break;
                default:
                    // Handle other task types if needed
            }
        }

        // Shuffle the positions to randomize their selection
        // This is important to ensure tasks are distributed evenly across the map
        if (positions.size() > 1) {
            shufflePositions(positions, random);
        }

        // Get the first position from the shuffled list
        Position position = positions.remove(0);

        // Update the taskPositionsMap with the modified list
        taskPositionsMap.put(type, positions);

        return position;
    }

    // Method to shuffle the positions list
    private void shufflePositions(List<Position> positions, Random random) {
        for (int i = positions.size() - 1; i > 0; i--) {
            int index = random.nextInt(i + 1);
            Position temp = positions.get(index);
            positions.set(index, positions.get(i));
            positions.set(i, temp);
        }
    }

    // Method to populate predetermined mine positions
    private void populateMinePositions(List<Position> positions) {
        // Add your predetermined mine positions to the positions list
        // Example:
        positions.add(new Position(100, 100));
        positions.add(new Position(200, 200));
        positions.add(new Position(300, 300));
        // Add more positions as needed
    }

    // Method to populate predetermined scan positions
    private void populateScanPositions(List<Position> positions) {
        // Add your predetermined scan positions to the positions list
        // Example:
        positions.add(new Position(400, 400));
        positions.add(new Position(500, 500));
        positions.add(new Position(600, 600));
        // Add more positions as needed
    }

    // Method to populate predetermined swipe positions
    private void populateSwipePositions(List<Position> positions) {
        // Add your predetermined swipe positions to the positions list
        // Example:
        positions.add(new Position(700, 700));
        positions.add(new Position(800, 800));
        positions.add(new Position(900, 900));
        // Add more positions as needed
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
