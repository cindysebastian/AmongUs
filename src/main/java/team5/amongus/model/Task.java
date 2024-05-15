package team5.amongus.model;

import java.util.ArrayList;
import java.util.Arrays;

public class Task extends Interactible{
   
    private boolean completed = false;
    private String assignedPlayer;
    private TaskType type;
    
    private Boolean inProgress;

    public Boolean getInProgress() {
        return inProgress;
    }

    public void setInProgress(Boolean inProgress) {
        this.inProgress = inProgress;
    }

    public boolean getTaskCompleted() {
        return completed;
    }

    public void setTaskCompleted(boolean comp) {
        this.completed = comp;
    }

   public void setCompleted(boolean completed) {
       this.completed = completed;
   }
    
    public String getAssignedPlayer() {
        return assignedPlayer;
    }

    public void setAssignedPlayer(String assignedPlayer) {
        this.assignedPlayer = assignedPlayer;
    }

    public void setType(TaskType type) {
        this.type = type;
    }

    public TaskType getType() {
        return type;
    }

    public Task(TaskType type, int posx, int posy, String assignedPlayer) {
        this.type = type;
        this.assignedPlayer = assignedPlayer;
        Position newPos= new Position(posx, posy);
        setPosition(newPos);
      
        completed = false;

    }
}
