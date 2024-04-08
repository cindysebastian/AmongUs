package team5.amongus.model;

import java.util.List;


public class Chat {
    private List<Message> chatRoom;

   public Chat(List<Message> messages) {
    this.chatRoom = messages;
   }

   public void addMessages(Message message) {
        chatRoom.add(message);
   }

   public List<Message> getMessages() {
        return chatRoom;
   }


}
