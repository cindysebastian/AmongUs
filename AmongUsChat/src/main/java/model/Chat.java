package chat.amongus;
import java.util.List;

public class Chat {
    private List<Message> chatRoom;
    private String roomCode;

   public Chat(List<Message> messages) {
    this.chatRoom = messages;
   }

   public void addMessages(Message message) {
        chatRoom.add(0, message);
   }

   public List<Message> getMessages() {
        return chatRoom;
   }

     public String getRoomCode() {
          return roomCode;
     }

     public void setRoomCode(String roomCode) {
          this.roomCode = roomCode;
     }


}
