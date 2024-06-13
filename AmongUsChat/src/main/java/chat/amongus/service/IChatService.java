

import java.util.List;
import team5.amongus.model.Message;

public interface IChatService {
    List<Message> processMessage(List<Message> chatMessages, Message message);
}