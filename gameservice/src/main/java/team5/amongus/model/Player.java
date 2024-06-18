package team5.amongus.model;

import java.io.Serializable;

public class Player implements Serializable, Cloneable {
    private String name;
    private Position position;
    private final Integer step = 12;
    private Boolean isMoving = false;
    private String facing = "RIGHT";
    private final int width = 80;
    private final int height = 80;
    private boolean canInteract = false;
    private boolean isAlive = true;
    private boolean willContinue = false;
    private long lastActivityTime;
    private boolean isHost = false;

    public Player(String name, Position position) {
        this.name = name;
        this.position = position;
        this.lastActivityTime = System.currentTimeMillis();
    }

    public Player(Imposter imposter) {
        this.name = imposter.getName();
        this.position = imposter.getPosition();
        this.lastActivityTime = imposter.getLastActivityTime();
        this.isHost = imposter.getIsHost();
    }

    public void setWillContinue(boolean set) {
        this.willContinue = set;
    }

    public boolean getWillContinue() {
        return this.willContinue;
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

    public boolean getIsHost() {
        return isHost;
    }

    public void setIsHost(boolean isHost) {
        this.isHost = isHost;
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

        if (newPosition.getX() < position.getX()) {
            setFacing("LEFT");
        } else if (newPosition.getX() > position.getX()) {
            setFacing("RIGHT");
        }
        this.position = newPosition;

    }

    public boolean collidesWith(Player otherPlayer) {
        if(otherPlayer.getisAlive()){
            return this.getBounds().intersects(otherPlayer.getBounds());
        }
        return false;
    }

    // Method to check collision with an Interactable thing
    public boolean collidesWith(Interactible thing) {
        return this.getBounds().intersects(thing.getBounds());
    }

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