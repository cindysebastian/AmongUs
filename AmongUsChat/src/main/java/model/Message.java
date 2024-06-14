package chat.amongus;

public class Message {
    private String content;
    private String sender;
    private String roomCode;

    public Message(String content, String sender, String roomCode) {
        this.content = content;
        this.sender = sender;
        this.roomCode = roomCode;

    }

    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getSender() {
        return sender;
    }
    public void setSender(String sender) {
        this.sender = sender;
    }

    
}