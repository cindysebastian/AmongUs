package team5.amongus.service;

import team5.amongus.model.Message;


import java.util.List;

public interface IChatService {
    List<Message> processMessage(List<Message> chatMessages, Message message);
}
