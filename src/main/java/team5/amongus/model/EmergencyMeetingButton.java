package team5.amongus.model;

public class EmergencyMeetingButton extends Interactible {
    private boolean isActive = false;
    private Position position;

    public EmergencyMeetingButton() {
        Position position = new Position(500, 600);
        setPosition(position);
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public Position getPosition() {
        return position;
    }

    public void setPosition(Position position) {
        this.position = position;
    }

    
}
