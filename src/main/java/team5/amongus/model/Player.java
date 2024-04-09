package team5.amongus.model;
import java.io.Serializable;

public class Player implements Serializable {
    private String name;
    private Position position;
    private String colour;
    private Integer step = 30;
    private Boolean ismoving = false ; 
    private String facing = "RIGHT";

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
        return ismoving;
    }
    public void setFacing(String direction) {
        this.facing = direction;
    }
    public void setIsMoving(Boolean isMoving) {
        this.ismoving = isMoving;
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

}