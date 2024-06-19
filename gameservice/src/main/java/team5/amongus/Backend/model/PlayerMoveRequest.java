package team5.amongus.Backend.model;

import java.util.List;

public class PlayerMoveRequest {
    private String playerName;
    private String direction;
    private List<String> directions;
    private String roomCode;

    

    public String getDirection() {
        return direction;
    }
    public void setDirection(String direction) {
        this.direction = direction;
    }
    public String getPlayerName() {
        return playerName;
    }
    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }
    public List<String> getDirections() {
        return directions;
    }
    public void setDirections(List<String> directions) {
        this.directions = directions;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }
}
