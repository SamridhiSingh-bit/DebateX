package com.debatex.backend;

import com.debatex.backend.dto.CreateRoomRequest;
import com.debatex.backend.dto.RegisterRequest;
import com.debatex.backend.dto.SendMessageRequest;
import com.debatex.backend.repository.DebateEvaluationRepository;
import com.debatex.backend.repository.DebateMessageRepository;
import com.debatex.backend.repository.RoomRepository;
import com.debatex.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
public class WebEndpointsMockMvcTests {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private DebateMessageRepository messageRepository;

    @Autowired
    private DebateEvaluationRepository evaluationRepository;

    @BeforeEach
    void setup() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        evaluationRepository.deleteAll();
        messageRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testHealthEndpointReturns200() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void testTopicsEndpointReturnsAllCuratedTopics() throws Exception {
        mockMvc.perform(get("/api/topics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(108))
                .andExpect(jsonPath("$[0].id").value("TOPIC_001"));
    }

    @Test
    void testAuthAndRoomEndpointsEndToEnd() throws Exception {
        // 1. Register User
        RegisterRequest registerReq = new RegisterRequest("Alice Debater", "alice@test.com", "password123");
        String registerJson = objectMapper.writeValueAsString(registerReq);

        String authResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("alice@test.com"))
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(authResponse).get("token").asText();

        // 2. Access /api/auth/me with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alice@test.com"));

        // 3. Create Room without token (should be rejected with 401 Unauthorized)
        CreateRoomRequest roomReq = new CreateRoomRequest(
                "TOPIC_001",
                "Pro-Life vs Pro-Choice",
                "Abortion, Reproduction & Bodily Autonomy",
                "Intermediate",
                "Expert"
        );
        String roomJson = objectMapper.writeValueAsString(roomReq);

        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roomJson))
                .andExpect(status().isUnauthorized());

        // 4. Create Room WITH token -> 201 Created
        String roomResponse = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roomJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomCode").isNotEmpty())
                .andExpect(jsonPath("$.status").value("CREATED"))
                .andReturn().getResponse().getContentAsString();

        String roomCode = objectMapper.readTree(roomResponse).get("roomCode").asText();

        // 5. Get Room by Code (Public permitted)
        mockMvc.perform(get("/api/rooms/" + roomCode))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomCode").value(roomCode))
                .andExpect(jsonPath("$.topicId").value("TOPIC_001"));

        // 6. Start Room
        mockMvc.perform(patch("/api/rooms/" + roomCode + "/start")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        // 7. Check Messages has Moderator Opening
        mockMvc.perform(get("/api/rooms/" + roomCode + "/messages")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].senderType").value("MODERATOR"));

        // 8. Send Argument
        SendMessageRequest sendReq = new SendMessageRequest(
                "The core ethical consideration is bodily autonomy, which is a fundamental human right."
        );
        mockMvc.perform(post("/api/rooms/" + roomCode + "/messages")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].senderType").value("HUMAN"))
                .andExpect(jsonPath("$[1].senderType").value("AI"));

        // 9. End Room
        mockMvc.perform(patch("/api/rooms/" + roomCode + "/end")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // 10. Get Evaluation
        mockMvc.perform(get("/api/rooms/" + roomCode + "/evaluation")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.humanScore").isNumber())
                .andExpect(jsonPath("$.aiScore").isNumber())
                .andExpect(jsonPath("$.winner").isNotEmpty());
    }
}
