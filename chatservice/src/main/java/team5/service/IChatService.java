package team5.service;



import java.util.List;

import team5.model.Message;

public interface IChatService {
    List<Message> processMessage(List<Message> chatMessages, Message message);
}