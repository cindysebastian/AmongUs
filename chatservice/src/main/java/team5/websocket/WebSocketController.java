package team5.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import team5.model.Message;
import team5.service.ChatService;

import java.util.List;

@Controller
public class WebSocketController{
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, ChatService chatService) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/sendMessage/{roomCode}")
    @SendTo("/topic/messages/{roomCode}")
    public List<Message> sendMessages(List<Message> chat, Message message, SimpMessagingTemplate accessor, @DestinationVariable String roomCode) {
        System.out.println("message arrived");
        List<Message> updatedChatMessages = chatService.processMessage(chat, message);
        return updatedChatMessages;
    }


}