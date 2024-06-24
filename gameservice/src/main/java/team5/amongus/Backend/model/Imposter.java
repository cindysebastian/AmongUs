package team5.amongus.Backend.model;

public class Imposter extends Player {

    
    private boolean canKill = false;

    

    public Imposter(String name, Position position, String sessionId) {
        super(name, position, sessionId);
    }

    public void kill(Player victim) {
        if (victim != null && victim.getisAlive()) { // Ensure the victim exists and is alive
            victim.setAlive(false); // Mark the victim as dead
            System.out.println("[Imposter.java] " + getName() + " killed " + victim.getName());
        } else {
            System.out.println("[Imposter.java] Unable to kill. Victim is already dead or does not exist.");
        }
    }

    public boolean getCanKill(){
        return canKill;
    }

    public void setCanKill(boolean canKill) {
        this.canKill = canKill;
    }

    
    
}
