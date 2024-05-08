package team5.amongus.model;

public class Imposter extends Player {

    public Imposter(String name, Position position) {
        super(name, position);
    }

    public void kill(Player victim) {
        if (victim != null && victim.isAlive()) { // Ensure the victim exists and is alive
            victim.setAlive(false); // Mark the victim as dead
            System.out.println(getName() + " killed " + victim.getName());
        } else {
            System.out.println("Unable to kill. Victim is already dead or does not exist.");
        }
    }
}
