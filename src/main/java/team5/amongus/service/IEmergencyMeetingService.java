package team5.amongus.service;

import java.util.Map;

import team5.amongus.model.Player;

public interface IEmergencyMeetingService {
    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap, String roomCode);

    public Player handleVoting(String playerName, String votedPlayer, Map<String, Player> playersMap, String roomCode);

    public Player submitVotes(Map<String, Player> playersMap, String roomCode);
}
