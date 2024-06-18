package team5.amongus.model;

public class HostGameRequest {
    private String playerName;
    private int playerCount;

    public void setPlayerCount(int playerCount) {
        this.playerCount = playerCount;
    }
    public int getPlayerCount() {
        return playerCount;
    }

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }
}
