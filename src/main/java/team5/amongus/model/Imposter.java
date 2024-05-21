package team5.amongus.model;

public class Imposter extends Player {

    
    private boolean canKill = false;

    

    public Imposter(String name, Position position) {
        super(name, position);
    }

    public void kill(Player victim) {
        if (victim != null && victim.isAlive()) { // Ensure the victim exists and is alive
            victim.setAlive(false); // Mark the victim as dead
            // setting Imposter position to victims position is not working here :(
            //Position newPosition = new Position(victim.getPosition().getX(), victim.getPosition().getY());
            //this.setPosition(newPosition);
            //System.out.println(this.getName() + "Imposters new position:" + newPosition);
            System.out.println(getName() + " killed " + victim.getName());
        } else {
            System.out.println("Unable to kill. Victim is already dead or does not exist.");
        }
    }

    public boolean getCanKill(){
        return canKill;
    }

    public void setCanKill(boolean canKill) {
        this.canKill = canKill;
    }
    
}
