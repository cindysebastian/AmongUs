package team5.amongus.websocket;

public class JoinGameRequest {
    private String playerName;
    private String roomCode;

    // Getters and setters
    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }

    @Override
    public String toString() {
        return "JoinGameRequest{" +
                "playerName='" + playerName + '\'' +
                ", roomCode='" + roomCode + '\'' +
                '}';
    }
}
