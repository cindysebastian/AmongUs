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
    private Map<String, Integer> votes = new HashMap<>();


    public EmergencyMeeting(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap) {
        int totalVotes = playersMap.size();
        System.out.println(playerName + " voted for: " + votedPlayer);
        votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) +1 );
        System.out.println("Total votes: " + totalVotes);
        System.out.println("Votes size: " + votes.size());
        System.out.println(playersMap);
        if (playersMap.size() == totalVotes) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            submitVotes(playersMap); 
        }
    }

    public void submitVotes(Map<String, Player> playersMap) {
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

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting", playerName);
    }

}
