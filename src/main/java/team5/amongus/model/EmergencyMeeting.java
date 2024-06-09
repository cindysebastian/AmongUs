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

    public void handleVoteTimout(String roomCode) {
        
    }

    public void handleVoting(String playerName, String votedPlayer, String vote, Map<String, Player> playersMap, String roomCode) {
        int totalAlivePlayers = 0;
        for (Player player : playersMap.values()) {
            if (player.getisAlive()) {
                totalAlivePlayers++;
            }
        }
        
        int totalVotes = playersMap.size();
        System.out.println(vote);
        System.out.println(playerName + " voted for: " + votedPlayer);
        if (vote.equals("vote")) {
            votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) +1 );
        }
        if (vote.equals("skip")) {
            votes.put("skip", votes.getOrDefault("skip", 0) +1);
        }
        int votesCast = 0;
        for (int voteCount : votes.values()) {
            votesCast += voteCount;
        }
        System.out.println("totalAlivePlayer:" + totalAlivePlayers);
        System.out.println("votes array: " + votes);
        if (votesCast == totalAlivePlayers) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            submitVotes(playersMap, roomCode); 
        }
    }

    public void submitVotes(Map<String, Player> playersMap, String roomCode) {
        String playerWithMostVotes = null;
        int maxVotes = 0;
        int skipVotes = votes.getOrDefault("skip", 0);
        int totalVotes = playersMap.size();
        int totalAlivePlayers = 0;
        for (Player player : playersMap.values()) {
            if (player.getisAlive()) {
                totalAlivePlayers++;
            }
        }
        int remainingVotes = totalAlivePlayers - skipVotes;
    
        // Check if all players have voted or if the 30-second timer has elapsed
        if (remainingVotes != 0) {
            // If not all players have voted, count remaining votes as "skip"
            votes.put("skip", skipVotes + remainingVotes);
        }
    
        for (Map.Entry<String, Integer> entry : votes.entrySet()) {
            if (entry.getValue() > maxVotes) {
                maxVotes = entry.getValue();
                playerWithMostVotes = entry.getKey();
            }
        }
        if (maxVotes > skipVotes) {
            Player ejectedPlayer = playersMap.get(playerWithMostVotes);
            if (ejectedPlayer != null) {
                ejectedPlayer.setAlive(false);
                messagingTemplate.convertAndSend("topic/ejectedPlayer/" + roomCode, ejectedPlayer);
            }
        } else {
            System.out.println("No player has been ejected.");
        }
        votes.clear();
    }

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, String roomCode) {
        messagingTemplate.convertAndSend("/topic/emergencyMeeting/" + roomCode, playerName);
    }

}
