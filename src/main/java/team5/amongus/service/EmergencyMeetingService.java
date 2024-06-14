package team5.amongus.service;

import java.util.Map;
import org.springframework.stereotype.Service;
import team5.amongus.model.EmergencyMeeting;
import team5.amongus.model.Player;
import team5.amongus.model.Position;

@Service
public class EmergencyMeetingService implements IEmergencyMeetingService {
    private int totalVotes = 0;
    private int skips = 0;
    private int votesCast = 0;

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode) {
        int x = 2000;
        int y = 550;
        for (Map.Entry<String,Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            Position meetingPosition = new Position(x, y);
            player.setPosition(meetingPosition);
            x += 30;
            y += 30;
        }
        totalVotes = 0;
        skips = 0;
        votesCast = 0;
        emergencyMeeting.setInMeeting(true);
        emergencyMeeting.setEjectedPlayer(null);
        emergencyMeeting.getVotes().clear(); // Clear votes from the previous meeting
    }

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode) {
        if (totalVotes == 0) {
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                Player player = entry.getValue();
                if (player.getisAlive()) {
                    totalVotes++;
                }
            }            
        }

        System.out.println(playerName + " voted for: " + votedPlayer);
        if (votedPlayer != null && !votedPlayer.isEmpty() && !votedPlayer.isBlank()) {
            Map<String, Integer> votes = emergencyMeeting.getVotes();
            votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) + 1);
            votesCast++;
        } else {
            System.out.println("skip");
            skips++;
            votesCast++;
        }

        System.out.println("voted player: " + votedPlayer);
        System.out.println("votes cast: " + votesCast);
        System.out.println("totalAlivePlayer: " + totalVotes);
        System.out.println("votes array: " + emergencyMeeting.getVotes());
        if (votesCast == totalVotes) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            submitVotes(playersMap, emergencyMeeting, roomCode); 
        }
    }

    public void submitVotes(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode) {
        String playerWithMostVotes = null;
        int maxVotes = 0;
        Map<String, Integer> votes = emergencyMeeting.getVotes();

        for (Map.Entry<String, Integer> entry : votes.entrySet()) {
            if (entry.getValue() > maxVotes) {
                maxVotes = entry.getValue();
                playerWithMostVotes = entry.getKey();
            }
        }
        
        if (maxVotes > skips) {
            Player ejectedPlayer = playersMap.get(playerWithMostVotes);
            if (ejectedPlayer != null) {
                playersMap.get(playerWithMostVotes).setAlive(false);
                emergencyMeeting.setEjectedPlayer(ejectedPlayer);
                System.out.println(ejectedPlayer.getName() + " has been ejected.");
            }
        } else {
            System.out.println("No player has been ejected.");
        }
        emergencyMeeting.setInMeeting(false);
        votes.clear();
    }
}
