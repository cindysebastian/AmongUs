package team5.amongus.model;

import java.time.LocalDateTime;

public class Sabotage {
    private String name; 
    private boolean inProgress = false;
    private LocalDateTime activationTime; // Add this field

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
        if (inProgress) {
            this.activationTime = LocalDateTime.now(); // Set activation time
        } else {
            this.activationTime = null; // Reset activation time
        }
    }

    public LocalDateTime getActivationTime() {
        return activationTime;
    }
}
