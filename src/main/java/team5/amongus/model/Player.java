package team5.amongus.model;

import java.io.Serializable;

public class Player implements Serializable {
    private String name;
    private Position position;
    private String colour;
    private Integer step = 30;
    private Boolean isMoving = false;
    private String facing = "RIGHT";
    private int width = 100;
    private int height = 150;
    private boolean canInteract = false;
    private boolean canKill = false;
    private long lastActivityTime;
    private String sessionId;

    public Player(String name, Position position) {
        this.name = name;
        this.position = position;
        this.lastActivityTime = System.currentTimeMillis();
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public void updateLastActivityTime() {
        this.lastActivityTime = System.currentTimeMillis();
    }

    public long getLastActivityTime() {
        return lastActivityTime;
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

    public boolean getCanInteract() {
        return canInteract;
    }

    public void setCanInteract(boolean canInteract) {
        this.canInteract = canInteract;
    }

    public boolean getCanKill() {
        return canKill;
    }

    public void setCanKill(boolean canKill) {
        this.canKill = canKill;
    }

    public void handleMovementRequest(String direction) {
        switch (direction) {
            case "UP":
                position.setY(position.getY() - step);

                break;
            case "DOWN":
                position.setY(position.getY() + step);

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

    // Method to check collision with an Interactable thing
    public boolean collidesWith(Interactible thing) {
        Boolean collidesWith = this.getBounds().intersects(thing.getBounds());
        System.out.println(collidesWith);
        return collidesWith;
    }

    // Method to get bounding box of the player
    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }

}