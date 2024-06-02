package team5.amongus.model;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonInclude;

public class Player implements Serializable, Cloneable {
    private String name;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Position position;
    private String colour;
    private Integer step = 12;
    private Boolean isMoving = false;
    private String facing = "RIGHT";
    private int width = 130;
    private int height = 130;
    private boolean canInteract = false;
    private boolean isAlive = true;

    private long lastActivityTime;
    private String sessionId;
    private boolean isHost = false;
   

    public Player(String name, Position position) {
        this.name = name;
        this.position = position;
        this.lastActivityTime = System.currentTimeMillis();
    }

   

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getStep() {
        return step;
    }

    public boolean isHost() {
        return isHost;
    }

    public void setHost(boolean host) {
        isHost = host;
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

    public Player(String name) {
        this.name = name;
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

    public boolean getisAlive() {
        return isAlive;
    }

    public void setAlive(boolean isAlive) {
        this.isAlive = isAlive;
    }

    public void handleMovementRequest(Position.Direction direction) {
        Position newPosition = position.getNextPosition(direction, step);
        if (isAlive) {
            if (newPosition.getX() < position.getX()) {
                setFacing("LEFT");
            } else if (newPosition.getX() > position.getX()) {
                setFacing("RIGHT");
            }
            this.position = newPosition;
        }
    }

    public boolean collidesWith(Player otherPlayer) {
        return this.getBounds().intersects(otherPlayer.getBounds());
    }

    // Method to check collision with an Interactable thing
    public boolean collidesWith(Interactible thing) {
        Boolean collidesWith = this.getBounds().intersects(thing.getBounds());
        return collidesWith;
    }

    // Method to get bounding box of the player
    public CollisionBox getBounds() {
        return new CollisionBox(position.getX(), position.getY(), width, height);
    }


    @Override
    public Object clone() throws CloneNotSupportedException {
        Player clonedPlayer = (Player) super.clone();
        // For custom classes like Position, ensure they are also cloneable and clone
        // them here
        if (this.position != null) {
            clonedPlayer.position = (Position) this.position.clone();
        }
        return (Player) clonedPlayer;
    }

}