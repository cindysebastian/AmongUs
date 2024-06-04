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

    public void handleVoting(String playerName, String votedPlayer, String vote, Map<String, Player> playersMap) {
        int totalVotes = playersMap.size();
        System.out.println(vote);
        System.out.println(playerName + " voted for: " + votedPlayer);
        if (vote.equals("yes")) {
            //System.out.println("vote is being added to array");
            votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) +1 );
        }
        if (vote.equals("no")) {
            votes.put("skip", votes.getOrDefault("skip", 0) +1);
        }
        int votesCast = 0;
        for (int voteCount : votes.values()) {
            votesCast += voteCount;
        }
        //System.out.println("Total votes: " + totalVotes);
        //System.out.println("Votes size: " + votes.size()); // y this zero?
        System.out.println("votes array: " + votes);
        //System.out.println(playersMap);
        if (votesCast == totalVotes) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            submitVotes(playersMap); 
        }
    }

    public void submitVotes(Map<String, Player> playersMap) {
        String playerWithMostVotes = null;
        int maxVotes = 0;
        int skipVotes = votes.getOrDefault("skip", 0);
        for (Map.Entry<String, Integer> entry : votes.entrySet()) {
            if (entry.getValue() > maxVotes) {
                maxVotes = entry.getValue();
                playerWithMostVotes = entry.getKey();
            }
        }
        if (maxVotes > skipVotes) {
            Player ejectedPlayer = playersMap.get(playerWithMostVotes);
            if (ejectedPlayer != null) {
                System.out.println(skipVotes);
                System.out.println(maxVotes);
                ejectedPlayer.setAlive(false);
                System.out.println("Ejected player:" + ejectedPlayer);
                messagingTemplate.convertAndSend("topic/ejectedPlayer", ejectedPlayer);
            }
        } else {
            System.out.println("No player has been ejected.");
        }
    }

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting", playerName);
    }

}
