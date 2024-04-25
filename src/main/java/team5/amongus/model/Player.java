package team5.amongus.model;
import java.io.Serializable;

public class Player implements Serializable {
    private String name;
    private Position position;
    private String colour;
    private Integer step = 30;
    private Boolean isMoving = false ; 
    private String facing = "RIGHT";
    private int width = 100;
    private int height = 150;
    private boolean canInteract = false;
    private boolean canKill = false;
   

    public Player (String name, Position position) {
        this.name = name;
        this.position = position;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }
    public String getFacing() {
        return facing;
    }
    public Boolean getIsMoving() {
        return isMoving;
    }
    public void setFacing(String direction) {
        this.facing = direction;
    }
    public void setIsMoving(Boolean isMoving) {
        this.isMoving = isMoving;
    }

    public boolean getCanInteract(){
        return canInteract;
    }

    public void setCanInteract(boolean canInteract){
        this.canInteract = canInteract;
    }

    public boolean getCanKill(){
        return canKill;
    }

    public void setCanKill(boolean canKill){
        this.canKill = canKill;
    }

    public void handleMovementRequest(String direction) {
        switch (direction) {
            case "UP":
                position.setY(position.getY() - step);
                System.out.println("Up");
                break;
            case "DOWN":
                position.setY(position.getY() + step);
                System.out.println("Down");
                break;
            case "LEFT":
                position.setX(position.getX() - step);
                setFacing("LEFT");
                break;
            case "RIGHT":
                position.setX(position.getX() + step);
                setFacing("RIGHT");
                break;
            default:
                break;
        }
        
    }


    public boolean collidesWith(Player otherPlayer) {
        return this.getBounds().intersects(otherPlayer.getBounds());
    }
    
    // Method to check collision with a button
    public boolean collidesWith(Task task) {
        return this.getBounds().intersects(task.getBounds());
    }
    
    // Method to get bounding box of the player
    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }

}