// TaskServiceImpl.java
package team5.amongus.service;

import team5.amongus.model.Player;
import java.util.Map;

import org.springframework.stereotype.Service;


@Service
public class TaskService implements ITaskService {
    @Override
    public void updateTaskInteractions(Map<String, Player> playersMap) {
        // Logic for updating task interactions...
    }
}