package team5.amongus.Backend.model;

public class SabotageTask extends Interactible {
    
    private boolean completed = true;
    private boolean inProgress = false;
    private Sabotage sabotage;
    private String triggeredBy = "";

    public SabotageTask(int posx, int posy, Sabotage sabotage) {
        setPosition(new Position(posx, posy));
        this.sabotage = sabotage;
    }

    public void setCompleted(boolean completed){
        this.completed = completed;
    }

    public boolean getCompleted(){
        return completed;
    }

    public void setInProgress(boolean inProgress){
        this.inProgress = inProgress;
    }

    public boolean getInProgress(){
        return inProgress;
    }

    public void setSabotage(Sabotage sabotage){
        this.sabotage = sabotage;
    }

    public Sabotage getSabotage(){
        return sabotage;
    }

    public void setTriggeredBy(String player){
        this.triggeredBy = player;
    }

    public String getTriggeredBy(){
        return triggeredBy;
    }
}
