package team5.amongus.model;

import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class EmergencyMeeting {
    private boolean inMeeting = false;
    private static SimpMessagingTemplate messagingTemplate = null;
    private int skips = 0;
    private int votesCast = 0;
    private int totalVotes = 0;

    public void setInMeeting(boolean inMeeting){
        this.inMeeting = inMeeting;
    }

    public boolean getInMeeting(){
        return inMeeting;
    }

    public void setSkips(int skips){
        this.skips = skips;
    }

    public int getSkips(){
        return skips;
    }

    public void setVotesCast(int votesCast){
        this.votesCast = votesCast;
    }

    public int getVotesCast(){
        return votesCast;
    }

    public void setTotalVotes(int totalVotes){
        this.totalVotes = totalVotes;
    }

    public int getTotalVotes(){
        return totalVotes;
    }
}
