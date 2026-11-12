package com.debatex.backend.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class AiProviderService {

    private static final Logger log = LoggerFactory.getLogger(AiProviderService.class);

    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int timeoutSeconds;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiProviderService(
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${app.ai.model:gpt-4o-mini}") String model,
            @Value("${app.ai.timeout-seconds:30}") int timeoutSeconds,
            ObjectMapper objectMapper) {

        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.model = model;
        this.timeoutSeconds = timeoutSeconds;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));

        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(this.baseUrl)
                .build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equalsIgnoreCase("test-key");
    }

    public String generateChatCompletion(String systemPrompt, List<ChatMessage> conversation) {
        if (!isConfigured()) {
            log.warn("AI API Key is not configured. OPENAI_API_KEY or AI_API_KEY environment variable required.");
            throw new IllegalStateException("AI provider is not configured. Please set the OPENAI_API_KEY environment variable on the backend.");
        }

        try {
            var messages = new java.util.ArrayList<Map<String, String>>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }
            for (ChatMessage msg : conversation) {
                messages.add(Map.of("role", msg.role(), "content", msg.content()));
            }

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", messages,
                    "temperature", 0.7
            );

            String responseString = restClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseString);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }

            throw new RuntimeException("Unexpected LLM response structure: " + responseString);

        } catch (Exception e) {
            log.error("AI API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI service failed: " + e.getMessage(), e);
        }
    }

    public String generateJsonCompletion(String systemPrompt, String userPrompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("AI provider is not configured. Please set the OPENAI_API_KEY environment variable on the backend.");
        }

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", 0.3
            );

            String responseString = restClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseString);
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }

            throw new RuntimeException("Unexpected LLM response structure: " + responseString);

        } catch (Exception e) {
            log.error("AI JSON API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI evaluation service failed: " + e.getMessage(), e);
        }
    }

    public record ChatMessage(String role, String content) {}
}
