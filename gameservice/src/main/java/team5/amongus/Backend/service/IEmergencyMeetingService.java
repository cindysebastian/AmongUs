package team5.amongus.Backend.service;

import java.util.Map;

import team5.amongus.Backend.model.EmergencyMeeting;
import team5.amongus.Backend.model.Player;

public interface IEmergencyMeetingService {
    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode, String meeting);

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode);

    public void submitVotes(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode);
}
