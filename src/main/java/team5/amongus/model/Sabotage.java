package team5.amongus.model;

public class Sabotage {
    private String name; 
    private boolean inProgress = false;

    public Sabotage(String name) {
        this.name = name;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public boolean getInProgress(){
        return inProgress;
    }

    public void setInProgress(boolean inProgress){
        this.inProgress = inProgress;
    }
}
