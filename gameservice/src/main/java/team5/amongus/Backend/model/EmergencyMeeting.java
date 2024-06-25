package team5.amongus.Backend.model;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class EmergencyMeeting extends Interactible {
    private boolean inMeeting = false;
    private Player ejectedPlayer = null;
    private Map<String, Integer> votes = new HashMap<>();
    private boolean isCooldownActive = false;

    public EmergencyMeeting() {
        setPosition(new Position(2100, 450));
        setHeight(250);
        setWidth(250);
        setId(60);
    }

    public void setInMeeting(boolean inMeeting) {
        this.inMeeting = inMeeting;
    }

    public boolean getInMeeting() {
        return inMeeting;
    }

    public void setIsCooldownActive(boolean ssCooldownActive) {
        this.isCooldownActive = ssCooldownActive;
    }

    public boolean getIsCooldownActive() {
        return isCooldownActive;
    }

    public void setEjectedPlayer(Player player) {
        this.ejectedPlayer = player;
    }

    public Player getEjectedPlayer() {
        return ejectedPlayer;
    }

    public void setVotes(Map<String, Integer> votes) {
        this.votes = votes;
    }

    public Map<String, Integer> getVotes() {
        return votes;
    }
}
