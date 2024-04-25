package team5.amongus.model;

public class Task {
    private Position position; 
    private int height = 50;
    private int width = 50;


    // Method to get bounding box of the player
    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }
    
}
