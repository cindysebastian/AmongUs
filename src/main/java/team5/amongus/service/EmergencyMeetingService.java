package team5.amongus.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import team5.amongus.model.EmergencyMeeting;
import team5.amongus.model.Player;
import team5.amongus.model.Position;

@Service
public class EmergencyMeetingService implements IEmergencyMeetingService {
    private EmergencyMeeting emergencyMeeting;

    public EmergencyMeetingService(EmergencyMeeting emergencyMeeting) {
        this.emergencyMeeting = emergencyMeeting;
    }

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, String roomCode) {
        int x = 2000;
        int y = 550;
        for (Map.Entry<String,Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            Position meetingPosition = new Position(x, y);
            player.setPosition(meetingPosition);
            x += 30;
            y += 30;
        }
        emergencyMeeting.setInMeeting(true);
    }

    public Player handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, String roomCode) {
        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            if (player.getisAlive()) {
                emergencyMeeting.setTotalVotes(+1);
            }
        }

        System.out.println(votedPlayer);
        System.out.println(playerName + " voted for: " + votedPlayer);
        if (!votedPlayer.equals("skip")) {
            playersMap.get(votedPlayer).setHasVotes(playersMap.get(votedPlayer).getHasVotes()+1);;
        }
        if (votedPlayer.equals("skip")) {
            emergencyMeeting.setSkips(+1);
        }
        emergencyMeeting.setVotesCast(+1);
        
        System.out.println("totalAlivePlayer:" + emergencyMeeting.getTotalVotes());
        System.out.println("votes array: " + emergencyMeeting.getVotesCast());
        if (emergencyMeeting.getVotesCast() == emergencyMeeting.getTotalVotes()) {
            System.out.println("VOTES HAVE BEEN CAST UwU");
            return submitVotes(playersMap, roomCode); 
        }
        return null;
    }

    public Player submitVotes(Map<String, Player> playersMap, String roomCode) {
        String maxVotedPlayer = "skip";
    
        for (Player player : playersMap.values()) {
            if (player.getHasVotes() > emergencyMeeting.getSkips() || player.getHasVotes() > playersMap.get(maxVotedPlayer).getHasVotes()) {
                maxVotedPlayer = player.getName();
            }
        }

        if (playersMap.get(maxVotedPlayer).getHasVotes() > emergencyMeeting.getSkips()) {
            if (maxVotedPlayer != "skip") {
                Player ejectedPlayer = playersMap.get(maxVotedPlayer);
                ejectedPlayer.setAlive(false);
                emergencyMeeting.setSkips(0);
                emergencyMeeting.setInMeeting(false);
                return ejectedPlayer;
            }
        } else {
            System.out.println("No player has been ejected.");
        }
        emergencyMeeting.setSkips(0);
        emergencyMeeting.setInMeeting(false);
        return null;
    }
}

