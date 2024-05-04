package team5.amongus.model;

public abstract class Interactible {
    
    private Position position;
    private int width = 150;
    private int height = 150;
    

    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }

    
    
}
