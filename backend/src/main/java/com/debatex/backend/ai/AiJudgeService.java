package com.debatex.backend.ai;

import com.debatex.backend.entity.DebateEvaluation;
import com.debatex.backend.entity.DebateMessage;
import com.debatex.backend.entity.Room;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiJudgeService {

    private static final Logger log = LoggerFactory.getLogger(AiJudgeService.class);

    private final AiProviderService aiProviderService;
    private final ObjectMapper objectMapper;

    public AiJudgeService(AiProviderService aiProviderService, ObjectMapper objectMapper) {
        this.aiProviderService = aiProviderService;
        this.objectMapper = objectMapper;
    }

    public DebateEvaluation evaluateDebate(Room room, List<DebateMessage> messages) {
        if (!aiProviderService.isConfigured()) {
            return generateUnconfiguredNoticeEvaluation(room, messages);
        }

        StringBuilder transcriptBuilder = new StringBuilder();
        for (DebateMessage msg : messages) {
            transcriptBuilder.append(String.format("[%s - Turn %d]: %s\n\n",
                    msg.getSenderType(), msg.getTurnNumber(), msg.getContent()));
        }

        String systemPrompt = """
                You are an impartial, world-class Debate Adjudicator and Chief Judge for DebateX.
                Your task is to comprehensively and fairly evaluate the completed debate between the HUMAN debater and the DEBATEX AI.

                CRITICAL EVALUATION MANDATES:
                1. Evaluate both participants strictly on the merits of their arguments, rhetoric, logic, and responsiveness.
                2. Do NOT automatically declare the AI the winner. If the human presented superior arguments, evidence, or rebuttals, declare the HUMAN as the winner. If they tied, declare TIE.
                3. Total score is strictly out of 100, broken down by these EXACT weighted criteria:
                   - logicalReasoningScore: (0 to 25 points) - Validity of premises, avoidance of fallacies, logical flow.
                   - argumentStrengthScore: (0 to 25 points) - Depth, persuasiveness, substantive weight of claims.
                   - rebuttalQualityScore: (0 to 20 points) - Directness and effectiveness of counter-points against opponent.
                   - evidenceScore: (0 to 15 points) - Quality of factual examples, analogies, and empirical support.
                   - clarityScore: (0 to 15 points) - Precision of language, conciseness, rhetorical coherence.
                4. The humanScore must equal the sum of the human's criterion scores.
                5. Provide insightful, actionable feedback for the human participant.

                You MUST return a valid JSON object matching this EXACT schema:
                {
                  "humanScore": <integer 0-100>,
                  "aiScore": <integer 0-100>,
                  "winner": "<HUMAN | AI | TIE>",
                  "logicalReasoningScore": <integer 0-25>,
                  "argumentStrengthScore": <integer 0-25>,
                  "rebuttalQualityScore": <integer 0-20>,
                  "evidenceScore": <integer 0-15>,
                  "clarityScore": <integer 0-15>,
                  "strongestArgument": "<Summary/quote of the human's most effective argument>",
                  "weakestArgument": "<Summary/quote of the human's least supported argument>",
                  "strengths": "<Key argumentative strengths exhibited by the human>",
                  "weaknesses": "<Vulnerabilities or fallacies in the human's stance>",
                  "suggestions": "<Concrete recommendations for future debates>",
                  "judgeExplanation": "<Impartial adjudicator synthesis explaining the decision>"
                }
                """;

        String userPrompt = String.format("""
                DEBATE TOPIC: "%s"
                CATEGORY: "%s"
                DIFFICULTY: "%s"

                TRANSCRIPT:
                %s

                Provide your official evaluation JSON now.
                """, room.getTopic(), room.getCategory(), room.getAiDifficulty(), transcriptBuilder);

        try {
            String jsonOutput = aiProviderService.generateJsonCompletion(systemPrompt, userPrompt);
            JsonNode root = objectMapper.readTree(jsonOutput);

            DebateEvaluation eval = new DebateEvaluation();
            eval.setRoom(room);

            int logical = clamp(root.path("logicalReasoningScore").asInt(18), 0, 25);
            int strength = clamp(root.path("argumentStrengthScore").asInt(18), 0, 25);
            int rebuttal = clamp(root.path("rebuttalQualityScore").asInt(14), 0, 20);
            int evidence = clamp(root.path("evidenceScore").asInt(10), 0, 15);
            int clarity = clamp(root.path("clarityScore").asInt(11), 0, 15);

            int calculatedHumanScore = logical + strength + rebuttal + evidence + clarity;
            int humanScore = root.has("humanScore") ? clamp(root.path("humanScore").asInt(), 0, 100) : calculatedHumanScore;
            int aiScore = root.has("aiScore") ? clamp(root.path("aiScore").asInt(), 0, 100) : 75;

            String winner = root.path("winner").asText("HUMAN").toUpperCase();
            if (!winner.equals("HUMAN") && !winner.equals("AI") && !winner.equals("TIE")) {
                winner = humanScore > aiScore ? "HUMAN" : (aiScore > humanScore ? "AI" : "TIE");
            }

            eval.setLogicalReasoningScore(logical);
            eval.setArgumentStrengthScore(strength);
            eval.setRebuttalQualityScore(rebuttal);
            eval.setEvidenceScore(evidence);
            eval.setClarityScore(clarity);
            eval.setHumanScore(humanScore);
            eval.setAiScore(aiScore);
            eval.setWinner(winner);

            eval.setStrongestArgument(root.path("strongestArgument").asText("Solid presentation of core arguments."));
            eval.setWeakestArgument(root.path("weakestArgument").asText("Assumptions left undefended in earlier turns."));
            eval.setStrengths(root.path("strengths").asText("Demonstrated critical engagement with the topic."));
            eval.setWeaknesses(root.path("weaknesses").asText("Could strengthen empirical evidence and rebuttals."));
            eval.setSuggestions(root.path("suggestions").asText("Focus on anticipating opponent counters and grounding claims in data."));
            eval.setJudgeExplanation(root.path("judgeExplanation").asText("A closely contested debate evaluating logic, evidence, and rebuttal effectiveness."));

            return eval;

        } catch (Exception e) {
            log.error("AI Judge parsing failed, falling back to structured diagnostic evaluation: {}", e.getMessage(), e);
            return generateUnconfiguredNoticeEvaluation(room, messages);
        }
    }

    private DebateEvaluation generateUnconfiguredNoticeEvaluation(Room room, List<DebateMessage> messages) {
        DebateEvaluation eval = new DebateEvaluation();
        eval.setRoom(room);

        long humanCount = messages.stream().filter(m -> "HUMAN".equalsIgnoreCase(m.getSenderType())).count();
        int score = (int) Math.min(75, 40 + humanCount * 8);

        eval.setLogicalReasoningScore(score * 25 / 100);
        eval.setArgumentStrengthScore(score * 25 / 100);
        eval.setRebuttalQualityScore(score * 20 / 100);
        eval.setEvidenceScore(score * 15 / 100);
        eval.setClarityScore(score * 15 / 100);
        eval.setHumanScore(score);
        eval.setAiScore(70);
        eval.setWinner(score >= 70 ? "HUMAN" : "AI");

        eval.setStrongestArgument("Arguments recorded across " + humanCount + " human turns.");
        eval.setWeakestArgument("Analysis of weak points requires OPENAI_API_KEY for deep LLM evaluation.");
        eval.setStrengths("Active participation and consistent turn defense.");
        eval.setWeaknesses("Pending deep semantic evaluation by OpenAI LLM Judge.");
        eval.setSuggestions("Set the OPENAI_API_KEY environment variable on the backend to activate full automated LLM adjudication.");
        eval.setJudgeExplanation("[Adjudicator Notice]: Full qualitative adjudication requires OPENAI_API_KEY to be configured in the backend environment. Baseline transcript recorded " + messages.size() + " total messages.");

        return eval;
    }

    private int clamp(int val, int min, int max) {
        return Math.max(min, Math.min(max, val));
    }
}
