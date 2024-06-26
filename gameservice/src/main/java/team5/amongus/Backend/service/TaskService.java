package team5.amongus.Backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import team5.amongus.Backend.model.DeadBody;
import team5.amongus.Backend.model.Imposter;
import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Position;
import team5.amongus.Backend.model.Room;
import team5.amongus.Backend.model.Task;
import team5.amongus.Backend.model.TaskType;

@Service
public class TaskService implements ITaskService {
    private final ObjectMapper objectMapper;

    public TaskService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    private final Map<TaskType, List<Position>> taskPositionsMap = new HashMap<>(); // Map to store task positions by
                                                                                    // type

    @Override
    public ArrayList<Interactible> createTasks(Map<String, Player> playersMap) {
        ArrayList<Interactible> interactibles = new ArrayList<>();
        TaskType[] taskTypes = TaskType.values();

        Random random = new Random();
        int taskIdCounter = 1; // Counter for generating unique task IDs

        Map<Player, Set<Position>> playerPositionsMap = new HashMap<>(); // Map to track positions assigned to each
                                                                         // player
        Set<Position> allAssignedPositions = new HashSet<>(); // Set to track all assigned positions

        for (Player player : playersMap.values()) {
            if (!(player instanceof Imposter)) {
                playerPositionsMap.put(player, new HashSet<>());

                for (int i = 0; i < 5; i++) { // Create five tasks for each player
                    // Generate a random index to get a random type of Task
                    TaskType type = taskTypes[random.nextInt(taskTypes.length)];

                    // Generate Positions based on Task Type
                    Position position = generateUniquePosition(type, playerPositionsMap.get(player),
                            allAssignedPositions,
                            taskTypes, random);

                    // Set the Task with a unique ID
                    Task task = new Task(type, position.getX(), position.getY(), player.getName());
                    task.setId(taskIdCounter++); // Assign a unique ID
                    interactibles.add(task);

                    // Track the position assigned to this player and globally
                    playerPositionsMap.get(player).add(position);
                    allAssignedPositions.add(position);
                }
            }
        }
        return interactibles;
    }

    private Position generateUniquePosition(TaskType initialType, Set<Position> assignedPositions,
            Set<Position> allAssignedPositions, TaskType[] taskTypes, Random random) {
        TaskType currentType = initialType;
        List<Position> positions;
        int attempts = 0;

        while (attempts < taskTypes.length) {
            positions = taskPositionsMap.getOrDefault(currentType, new ArrayList<>());
            if (positions.isEmpty()) {
                // Populate the list with predetermined coordinates for the task type
                switch (currentType) {
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
            if (positions.size() > 1) {
                shufflePositions(positions, random);
            }

            for (Position pos : positions) {
                if (!positionIsUsed(pos, assignedPositions)) {
                    // If the position is not used by any player, use it
                    assignedPositions.add(pos);
                    allAssignedPositions.add(pos);
                    return new Position(pos.getX(), pos.getY()); // Return a new instance to avoid modifying the
                                                                 // original position
                }
            }

            // Reset positionsAvailable flag for the next task type
            boolean positionsAvailable = false;

            // Check if there are available positions for other task types
            for (TaskType type : taskTypes) {
                if (type != currentType && !taskPositionsMap.getOrDefault(type, new ArrayList<>()).isEmpty()) {
                    currentType = type; // Change currentType to the type with available positions
                    positionsAvailable = true;
                    break;
                }
            }

            if (!positionsAvailable) {
                // If no unique positions are available, reuse positions while ensuring no
                // player gets the same position twice
                List<Position> availablePositions = new ArrayList<>(allAssignedPositions);
                availablePositions.removeAll(assignedPositions);

                if (!availablePositions.isEmpty()) {
                    // Get a random available position
                    Position randomPosition = availablePositions.get(random.nextInt(availablePositions.size()));
                    assignedPositions.add(randomPosition);

                    // Change the currentType to the type corresponding to the reused position
                    for (Map.Entry<TaskType, List<Position>> entry : taskPositionsMap.entrySet()) {
                        if (entry.getValue().contains(randomPosition)) {
                            currentType = entry.getKey();
                            break;
                        }
                    }

                    return new Position(randomPosition.getX(), randomPosition.getY());
                } else {
                    // Fallback: return the position (0, 0) if all types are exhausted
                    Position fallbackPosition = new Position(0, 0);
                    // Update assignedPositions and allAssignedPositions with the fallback position
                    assignedPositions.add(fallbackPosition);
                    allAssignedPositions.add(fallbackPosition);
                    return fallbackPosition;
                }
            }

            // Try the next task type
            attempts++;
        }

        // This part should not be reached under normal circumstances, as there should
        // always be available positions for at least one task type
        throw new IllegalStateException("Not enough Task Positions for all Players");
    }

    // Method to check if a position is already used
    private boolean positionIsUsed(Position pos, Set<Position> positions) {
        for (Position p : positions) {
            if (p.getX() == pos.getX() && p.getY() == pos.getY()) {
                return true;
            }
        }
        return false;
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
        positions.add(new Position(1900, 180));
        positions.add(new Position(850, 350));
        positions.add(new Position(700, 1650));
        positions.add(new Position(2100, 1340));
        positions.add(new Position(2900, 1800));
        positions.add(new Position(3000, 290));

        // Add more positions as needed
    }

    // Method to populate predetermined scan positions
    private void populateScanPositions(List<Position> positions) {
        // Add your predetermined scan positions to the positions list
        // Example:
        positions.add(new Position(650, 660));
        positions.add(new Position(960, 1000));
        positions.add(new Position(2300, 2000));
        positions.add(new Position(2600, 1350));
        positions.add(new Position(1650, 1000));
        positions.add(new Position(1150, 900));

        // Add more positions as needed
    }

    // Method to populate predetermined swipe positions
    private void populateSwipePositions(List<Position> positions) {
        // Add your predetermined swipe positions to the positions list
        // Example:
        positions.add(new Position(2600, 200));
        positions.add(new Position(480, 730));
        positions.add(new Position(750, 1400));
        positions.add(new Position(1500, 1240));
        positions.add(new Position(2500, 1800));
        positions.add(new Position(3600, 830));

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
                        if (!((Task) currentObj).getTaskCompleted()) {

                            task.setInProgress(true);
                            ((Task) currentObj).setInProgress(true);
                        } else {
                            System.out.println("[TaskService.java] Task already Completed");
                        }
                    }
                }
            }

        }
        return interactibles;
    }

    public ArrayList<Interactible> completeTask(String payload, ArrayList<Interactible> interactibles) {
        try {

            JsonNode jsonNode = objectMapper.readTree(payload);
            int interactibleId = jsonNode.get("interactibleId").asInt();

            Interactible interactibleToUpdate = Interactible.getInteractibleById(interactibleId, interactibles);
            if (interactibleToUpdate != null && interactibleToUpdate instanceof Task) {
                Task task = (Task) interactibleToUpdate;
                if (task.getInProgress()) {
                    // Set completed to true and inProgress to false
                    task.setCompleted(true);
                    task.setInProgress(false);
                    // No need to set the interactible back into the list, as it's already a
                    // reference
                    return interactibles;
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
            // Handle JSON parsing exception
        }
        System.out.println("[TaskService.java] Task Completion Error");
        return interactibles;
    }

    @Override
    public void generateDeadBody(Imposter imposter, Room room) {
        room.getInteractibles().add(new DeadBody(imposter.getPosition()));
    }
}
