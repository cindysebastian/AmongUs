// TaskService.java
package team5.amongus.service;

import team5.amongus.model.Interactible;
import team5.amongus.model.Player;
import team5.amongus.model.Task;

import java.util.ArrayList;
import java.util.Map;

public interface ITaskService {
    ArrayList<Interactible> updateTaskInteractions(Map<String, Player> playersMap, ArrayList<Interactible> interactibles, Player player, Task task);
}