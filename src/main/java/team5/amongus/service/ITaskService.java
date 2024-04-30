// TaskService.java
package team5.amongus.service;

import team5.amongus.model.Player;

import java.util.Map;

public interface ITaskService {
    void updateTaskInteractions(Map<String, Player> playersMap);
}