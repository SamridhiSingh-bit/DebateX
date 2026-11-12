package com.debatex.backend.ai;

import com.debatex.backend.entity.DebateMessage;
import com.debatex.backend.entity.Room;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiOpponentService {

    private final AiProviderService aiProviderService;

    public AiOpponentService(AiProviderService aiProviderService) {
        this.aiProviderService = aiProviderService;
    }

    public String generateCounterargument(Room room, List<DebateMessage> messageHistory, String latestUserArgument) {
        if (!aiProviderService.isConfigured()) {
            return "[AI Opponent Configuration Notice]: The debate opponent is ready, but OPENAI_API_KEY has not been set in the backend environment variables. Please provide an OpenAI API key (or set OPENAI_API_KEY) to enable live LLM counterarguments.";
        }

        String difficulty = room.getAiDifficulty() != null ? room.getAiDifficulty() : "Expert";
        String systemPrompt = buildSystemPrompt(room.getTopic(), room.getCategory(), difficulty);

        List<AiProviderService.ChatMessage> chatHistory = new ArrayList<>();
        for (DebateMessage msg : messageHistory) {
            if ("HUMAN".equalsIgnoreCase(msg.getSenderType())) {
                chatHistory.add(new AiProviderService.ChatMessage("user", msg.getContent()));
            } else if ("AI".equalsIgnoreCase(msg.getSenderType())) {
                chatHistory.add(new AiProviderService.ChatMessage("assistant", msg.getContent()));
            }
        }

        // Add the latest user argument
        chatHistory.add(new AiProviderService.ChatMessage("user", latestUserArgument));

        return aiProviderService.generateChatCompletion(systemPrompt, chatHistory);
    }

    private String buildSystemPrompt(String topic, String category, String difficulty) {
        String base = """
                You are DebateX AI, an elite, intellectually rigorous debate opponent participating in a structured 1v1 debate against a human user on the platform DebateX.

                DEBATE TOPIC: "%s"
                CATEGORY: "%s"
                ROLE: You must analyze the human user's opening or latest position and take the opposing position. Defend your opposing stance with conviction, precision, and intellectual honesty.

                CORE GUIDELINES:
                1. Directly address and dismantle the specific points, premises, and examples made by the human debater. Never give vague, generic, or canned responses.
                2. Identify hidden assumptions, logical fallacies, unproven premises, and unintended consequences in their argument.
                3. Ground your counterarguments in sound logic, recognized principles, real-world analogies, and credible reasoning. Do not fabricate fake statistics or non-existent studies.
                4. Maintain a respectful, debate-arena tone: professional, articulate, intellectually sharp, and challenging.
                5. Structure your response clearly with a direct rebuttal, an affirmative counter-point, and conclude with a sharp, probing follow-up question that puts the burden of proof back on the human.
                6. Keep response length concise and punchy (around 120-220 words) suitable for an interactive debate exchange.
                """.formatted(topic, category);

        return switch (difficulty) {
            case "Beginner" -> base + """

                    DIFFICULTY LEVEL: BEGINNER
                    - Use simple, accessible reasoning and clear, everyday examples.
                    - State counterpoints plainly without overly complex philosophical or technical jargon.
                    - Offer an encouraging yet firm counterargument and ask an understandable follow-up question.
                    """;
            case "Intermediate" -> base + """

                    DIFFICULTY LEVEL: INTERMEDIATE
                    - Present well-structured, multi-layered counterarguments with deeper reasoning.
                    - Directly challenge the human's key assumptions and provide realistic counter-examples.
                    - Maintain a competitive debate posture and ask a challenging follow-up question.
                    """;
            default -> base + """

                    DIFFICULTY LEVEL: EXPERT (Default)
                    - Employ master-level argumentation, deep philosophical, economic, or ethical analysis, and rigorous analytical scrutiny.
                    - Scrutinize epistemological assumptions, trade-offs, edge cases, and formal or informal logical fallacies (e.g. false dilemma, ad populum, post hoc).
                    - Deliver incisive, evidence-based rebuttals and finish with a devastatingly sharp, thought-provoking question.
                    """;
        };
    }
}
