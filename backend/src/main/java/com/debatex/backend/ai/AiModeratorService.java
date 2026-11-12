package com.debatex.backend.ai;

import com.debatex.backend.entity.Room;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiModeratorService {

    private final AiProviderService aiProviderService;

    public AiModeratorService(AiProviderService aiProviderService) {
        this.aiProviderService = aiProviderService;
    }

    public String generateOpeningStatement(Room room) {
        if (!aiProviderService.isConfigured()) {
            return String.format(
                    "Welcome to DebateX Arena. I am your AI Moderator.\n\n" +
                    "TOPIC: %s (%s)\n" +
                    "FORMAT: Human vs DebateX AI (%s Level)\n\n" +
                    "RULES:\n" +
                    "1. Present clear, reasoned arguments focused directly on the topic.\n" +
                    "2. Avoid ad hominem attacks and adhere to respectful discourse.\n" +
                    "3. Each turn should be concise and focused.\n\n" +
                    "The floor is now open. Human debater, please present your opening argument.",
                    room.getTopic(), room.getCategory(), room.getAiDifficulty()
            );
        }

        try {
            String systemPrompt = """
                    You are the AI Moderator of DebateX, an elite competitive debate platform.
                    Your duty is to formally open the debate session, explain the ground rules clearly, establish the format, and invite the human participant to deliver their opening argument.
                    Keep your opening statement under 120 words, authoritative, neutral, and welcoming.
                    """;

            String userPrompt = String.format(
                    "Open a debate on the topic '%s' (Category: %s). The human debater is challenging the DebateX AI at %s difficulty level.",
                    room.getTopic(), room.getCategory(), room.getAiDifficulty()
            );

            return aiProviderService.generateChatCompletion(
                    systemPrompt,
                    List.of(new AiProviderService.ChatMessage("user", userPrompt))
            );
        } catch (Exception e) {
            return String.format(
                    "Welcome to DebateX Arena. I am your AI Moderator. Today's debate is on: '%s'. Rules: Keep arguments concise, logical, and respectful. Human debater, the arena is yours—present your opening argument.",
                    room.getTopic()
            );
        }
    }

    public String checkRelevanceAndQuality(String topic, String userArgument) {
        // Quick deterministic checks
        if (userArgument == null || userArgument.trim().length() < 5) {
            return "Your argument is too brief to evaluate. Please present a substantive point.";
        }

        if (userArgument.trim().length() > 3000) {
            return "Your argument exceeds the recommended length. Please keep arguments focused (under 500 words).";
        }

        return null; // Valid argument
    }
}
