// TaskService.java
package team5.amongus.Backend.service;

import java.util.ArrayList;
import java.util.Map;

import team5.amongus.Backend.model.Imposter;
import team5.amongus.Backend.model.Interactible;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Room;
import team5.amongus.Backend.model.Task;

public interface ITaskService {
    public ArrayList<Interactible> createTasks(Map<String, Player> playersMap);

    ArrayList<Interactible> updateTaskInteractions(Map<String, Player> playersMap, ArrayList<Interactible> interactibles, Player player, Task task);

    public ArrayList<Interactible> completeTask(String payload, ArrayList<Interactible> interactebels);

    public void generateDeadBody(Imposter imposter, Room room);
    
}