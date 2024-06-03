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

    public void handleEmergencyMeeting(String playerName, Map<String, Player> playersMap) {
        emergencyMeeting.handleEmergencyMeeting(playerName, playersMap);
        int x = 2000;
        int y = 550;
        for (Map.Entry<String,Player> entry : playersMap.entrySet()) {
            Player player = entry.getValue();
            Position meetingPosition = new Position(x, y);
            player.setPosition(meetingPosition);
            x += 30;
            y += 30;
        }
        throw new UnsupportedOperationException("Unimplemented method 'handleEmergencyMeeting'");
    }

}

