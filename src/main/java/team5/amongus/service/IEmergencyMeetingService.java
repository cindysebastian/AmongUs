package team5.amongus.service;

import java.util.Map;

import team5.amongus.model.EmergencyMeeting;
import team5.amongus.model.Player;

public interface IEmergencyMeetingService {
    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode);

    public void handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode);

    public void submitVotes(Map<String, Player> playersMap, EmergencyMeeting emergencyMeeting, String roomCode);
}
