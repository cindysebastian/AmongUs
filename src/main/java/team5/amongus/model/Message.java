package team5.amongus.model;


public class Message {
    private String content;
    private Player sender;

    public Message(String content, Player sender) {
        this.content = content;
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public Player getSender() {
        return sender;
    }
    public void setSender(Player sender) {
        this.sender = sender;
    }

    
}