package team5.amongus.model;

import org.springframework.stereotype.Component;

@Component
public class EmergencyMeeting {
    private boolean inMeeting = false;
    private Player ejectedPlayer = null;

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
