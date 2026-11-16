package com.app.Readscape.service.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class AiService {
    
    private final ChatClient chatClient;

    public AiService(ChatClient.Builder builder) {

        this.chatClient = builder.defaultSystem("""
            You are Readscape's AI reading assistant.
            
            Responsibilities include:
            - Providing personalized reading suggestions
            - Explaining literary terms and genres
                - Helping readers discover books
                - Providing insights about reading habits

                Be helpful, concise, and accurate.

                Do not invent book metadata or claim
                to have accessed account information
                unless it was provided to you.""")
                .build();

    }

    public String generateResponse(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }

}
