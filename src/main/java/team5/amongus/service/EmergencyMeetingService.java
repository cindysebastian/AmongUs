package team5.amongus.service;

import org.springframework.stereotype.Service;

import team5.amongus.model.GameManager;
import team5.amongus.model.Player;

@Service
public class EmergencyMeetingService implements IEmergencyMeetingService {
    private GameManager gameManager;

    public EmergencyMeetingService(GameManager gameManager) {
        this.gameManager = gameManager;
    }

    public void callEmergencyMeeting(Player playerName) {
        gameManager.handleEmergencyMeeting(playerName);
    }
}

