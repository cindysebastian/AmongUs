package team5.amongus.model;


public class Task extends Interactible {

    private boolean completed = false;
    private String assignedPlayer;
    private TaskType type;

    private Boolean inProgress =false;

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
       
   @Override
    public String toString() {
        return "Task{" +
                "completed= " + completed +
                ", assignedPlayer= '" + assignedPlayer + '\'' +
                ", type= " + type +
                ", inProgress= " + inProgress +
                ", id= " + getId() +
                ", position x= " + getPosition().getX() +
                ", position y= " + getPosition().getY() +
                '}';
    }
    
}
