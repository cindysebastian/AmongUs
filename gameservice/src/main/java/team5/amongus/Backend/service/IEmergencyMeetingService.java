package team5.amongus.Backend.service;

import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import team5.amongus.Backend.model.EmergencyMeeting;
import team5.amongus.Backend.model.Player;
import team5.amongus.Backend.model.Room;

public interface IEmergencyMeetingService {
    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, Room room, String meeting, SimpMessagingTemplate messagingTemplate);

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, Room room, SimpMessagingTemplate msg);

    public void submitVotes(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, Room room, SimpMessagingTemplate msg);
}
