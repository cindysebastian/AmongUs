package team5.amongus.model;

import org.springframework.stereotype.Component;

@Component
public class EmergencyMeeting extends Interactible {
    private boolean inMeeting = false;
    private Player ejectedPlayer = null;

    public EmergencyMeeting() {
        setPosition(new Position(2100, 450));
        setHeight(250);
        setWidth(250);
        setId(60);
    }

    public void setInMeeting(boolean inMeeting){
        this.inMeeting = inMeeting;
    }

    public boolean getInMeeting(){
        return inMeeting;
    }

    public void setEjectedPlayer(Player player){
        this.ejectedPlayer = player;
    }

    public Player getEjectedPlayer(){
        return ejectedPlayer;
    }
}
