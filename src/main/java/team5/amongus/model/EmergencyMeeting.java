package team5.amongus.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class EmergencyMeeting {
    private boolean inMeeting;
    private static SimpMessagingTemplate messagingTemplate = null;
    private Map<String, Player> playersMap;
    private Map<String, Integer> votes = new HashMap<>();
    private int totalVotes;

    public EmergencyMeeting(Map<String, Player> playersMap, SimpMessagingTemplate messagingTemplate) {
        this.playersMap = playersMap;
        this.messagingTemplate = messagingTemplate;
        this.totalVotes = playersMap.size();
    }

    public boolean allPlayersVoted() {
        return votes.size() == totalVotes;
    }

    public void handleVoting(String playerName, String votedPlayer) {
        System.out.println(playerName + " voted for: " + votedPlayer);
        votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) +1 );
        totalVotes++;
        System.out.println(playersMap);
        if (allPlayersVoted()) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            submitVotes(); 
        }
    }

    public void submitVotes() {
        if (allPlayersVoted()) {
            String playerWithMostVotes = null;
            int maxVotes = 0;
            for (Map.Entry<String, Integer> entry : votes.entrySet()) {
                if (entry.getValue() > maxVotes) {
                    maxVotes = entry.getValue();
                    playerWithMostVotes = entry.getKey();
                }
            }
            if (playerWithMostVotes != null) {
                Player ejectedPlayer = playersMap.get(playerWithMostVotes);
                if (ejectedPlayer != null) {
                    ejectedPlayer.setAlive(false);
                    System.out.println("Ejected player:" + ejectedPlayer);
                    messagingTemplate.convertAndSend("topic/ejectedPlayer", ejectedPlayer);
                }
            }
        }
    }

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting", playerName);
    }

}
