package team5.amongus.Backend.service;

import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import team5.amongus.Backend.model.EmergencyMeeting;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Position;
import team5.amongus.Backend.model.Room;

@Service
public class EmergencyMeetingService implements IEmergencyMeetingService {
    private int totalVotes = 0;
    private int skips = 0;
    private int votesCast = 0;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap,
            EmergencyMeeting emergencyMeeting, Room room, String meeting, SimpMessagingTemplate messagingTemplate) {
        if (emergencyMeeting.getIsCooldownActive() && meeting != "deadbody") {
            System.out.println(
                    "[EmergencyMeetingService.java] Emergency meeting cooldown is active. Cannot start a new meeting.");
            return;
        }

        int x = 2000;
        int y = 550;
        for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            Position meetingPosition = new Position(x, y);
            player.setHasVoted(false);
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

        startMeetingCountdown(playersMap, emergencyMeeting, room, messagingTemplate);
        startCooldown(emergencyMeeting);
    }

    private void startCooldown(EmergencyMeeting emergencyMeeting) {
        emergencyMeeting.setIsCooldownActive(true);
        scheduler.schedule(() -> {
            emergencyMeeting.setIsCooldownActive(false);
            System.out.println("[EmergencyMeetingService.java] Emergency meeting cooldown has ended.");
        }, 120, TimeUnit.SECONDS); // 120 seconds cooldown
    }

    private void startEjectGifCountdown(EmergencyMeeting emergencyMeeting, Room room, SimpMessagingTemplate msg) {
        scheduler.schedule(() -> {
            emergencyMeeting.setInMeeting(false);
            System.out.println("[EmergencyMeetingService.java] Ejected Gif has ended");
            room.getEmergencyMeeting().setFinalising(false);
            room.forcebroadcastInteractiblesUpdate(msg);
        }, 5, TimeUnit.SECONDS);
    }

    private void startMeetingCountdown(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting,
            Room room, SimpMessagingTemplate msg) {
        scheduler.schedule(() -> {
            if (emergencyMeeting.getInMeeting()) {
                submitVotes(playersMap, emergencyMeeting, room, msg);
            }
            System.out.println("[EmergencyMeetingService.java] Emergency meeting countdown has ended.");
        }, 30, TimeUnit.SECONDS);
    }

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap,
            EmergencyMeeting emergencyMeeting, Room room, SimpMessagingTemplate swp) {
        if (!emergencyMeeting.getInMeeting()) {
            return;
        }

        if (totalVotes == 0) {
            for (Map.Entry<String, Player> entry : playersMap.entrySet()) {
                Player player = entry.getValue();
                if (player.getisAlive()) {
                    totalVotes++;
                }
            }
        }

        System.out.println("[EmergencyMeetingService.java] " + playerName + " voted for: " + votedPlayer);
        if (votedPlayer != null && !votedPlayer.isEmpty() && !votedPlayer.isBlank()) {
            Map<String, Integer> votes = emergencyMeeting.getVotes();
            votes.put(votedPlayer, votes.getOrDefault(votedPlayer, 0) + 1);
            votesCast++;
        } else {
            System.out.println("[EmergencyMeetingService.java] skip");
            skips++;
            votesCast++;
        }
        playersMap.get(playerName).setHasVoted(true);

        System.out.println("[EmergencyMeetingService.java] voted player: " + votedPlayer);
        System.out.println("[EmergencyMeetingService.java] votes cast: " + votesCast);
        System.out.println("[EmergencyMeetingService.java] totalAlivePlayer: " + totalVotes);
        System.out.println("[EmergencyMeetingService.java] votes array: " + emergencyMeeting.getVotes());
        room.broadcastPlayerUpdate(swp);
        if (votesCast == totalVotes) {
            System.out.println("[EmergencyMeetingService.java] Recieved votes from all players");
            submitVotes(playersMap, emergencyMeeting, room, swp);
        }
    }

    public void submitVotes(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, Room room, SimpMessagingTemplate smp) {
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
                room.getEmergencyMeeting().setFinalising(true);
                room.broadcastInteractiblesUpdate(smp);
                System.out.println("[EmergencyMeetingService.java] " + ejectedPlayer.getName() + " has been ejected.");
            }
        } else {
            room.getEmergencyMeeting().setFinalising(true);
            room.broadcastInteractiblesUpdate(smp);
            System.out.println("[EmergencyMeetingService.java] No player has been ejected.");

        }
        
        startEjectGifCountdown(emergencyMeeting, room, smp);
        for(Map.Entry<String, Player> player : playersMap.entrySet()){
            player.getValue().setHasVoted(false);
        }
        votes.clear();
    }
}
