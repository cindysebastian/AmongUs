package team5.amongus.websocket;

public class HostGameResponse {
    String status;
    String roomCode;

    public String getRoomCode() {
        return roomCode;
    }
    public String getStatus() {
        return status;
    }
    public void setRoomCode(String roomCode) {
        this.roomCode = roomCode;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public HostGameResponse(String status, String roomCode){
        this.status = status;
        this.roomCode = roomCode;
    }

}
