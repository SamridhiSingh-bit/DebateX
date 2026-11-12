package com.debatex.backend;

import com.debatex.backend.dto.*;
import com.debatex.backend.entity.DebateEvaluation;
import com.debatex.backend.entity.Room;
import com.debatex.backend.repository.*;
import com.debatex.backend.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class DebateXFlowIntegrationTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private TopicService topicService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private DebateMessageService messageService;

    @Autowired
    private DebateEvaluationService evaluationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private DebateEvaluationRepository evaluationRepository;

    @Autowired
    private DebateMessageRepository messageRepository;

    @BeforeEach
    void setUp() {
        evaluationRepository.deleteAll();
        messageRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testTopicLibraryLoadsCuratedTopics() {
        List<TopicDto> topics = topicService.getAllTopics();
        assertNotNull(topics);
        assertFalse(topics.isEmpty(), "Topic library should load curated topics");
        assertEquals(108, topics.size(), "Should load exactly 108 curated topics");

        assertTrue(topicService.isValidTopicId("TOPIC_001"));
        assertTrue(topicService.isValidTopicId("TOPIC_108"));
        assertFalse(topicService.isValidTopicId("INVALID_TOPIC_999"));

        var topic1 = topicService.getTopicById("TOPIC_001").orElseThrow();
        assertEquals("Pro-Life vs Pro-Choice", topic1.title());
        assertEquals("Abortion, Reproduction & Bodily Autonomy", topic1.category());
    }

    @Test
    void testUserRegistrationAndLogin() {
        RegisterRequest registerReq = new RegisterRequest("Samridhi", "sam@example.com", "password123");
        AuthResponse registered = authService.register(registerReq);

        assertNotNull(registered);
        assertNotNull(registered.token());
        assertEquals("sam@example.com", registered.email());
        assertEquals("Samridhi", registered.name());

        // Duplicate registration fails
        assertThrows(ResponseStatusException.class, () -> authService.register(registerReq));

        // Login succeeds
        LoginRequest loginReq = new LoginRequest("sam@example.com", "password123");
        AuthResponse loggedIn = authService.login(loginReq);
        assertNotNull(loggedIn.token());

        // Invalid password fails
        LoginRequest badLogin = new LoginRequest("sam@example.com", "wrongpassword");
        assertThrows(ResponseStatusException.class, () -> authService.login(badLogin));
    }

    @Test
    void testRoomCreationRejectsInvalidTopic() {
        CreateRoomRequest invalidReq = new CreateRoomRequest(
                "FAKE_TOPIC_XYZ",
                "Fake Title",
                "Technology",
                "Intermediate",
                "Expert"
        );

        assertThrows(ResponseStatusException.class, () -> roomService.createRoom(invalidReq, "sam@example.com"));
    }

    @Test
    void testCompleteDebateFlow() {
        // 1. Create Room with valid curated topic
        CreateRoomRequest roomReq = new CreateRoomRequest(
                "TOPIC_006",
                "Artificial Intelligence: Existential Threat vs Humanitarian Boon",
                "Technology, AI & Surveillance",
                "Advanced",
                "Expert"
        );

        RoomResponse createdRoom = roomService.createRoom(roomReq, null);
        assertNotNull(createdRoom.roomCode());
        assertEquals(6, createdRoom.roomCode().length());
        assertEquals("CREATED", createdRoom.status());
        assertEquals("TOPIC_006", createdRoom.topicId());
        assertEquals("Expert", createdRoom.aiDifficulty());

        String roomCode = createdRoom.roomCode();

        // 2. Start Room
        RoomResponse startedRoom = roomService.startRoom(roomCode);
        assertEquals("IN_PROGRESS", startedRoom.status());
        assertNotNull(startedRoom.startedAt());

        // Verify AI Moderator opening statement was posted
        List<MessageResponse> initialMessages = messageService.getMessages(roomCode);
        assertEquals(1, initialMessages.size());
        assertEquals("MODERATOR", initialMessages.get(0).senderType());
        assertEquals(0, initialMessages.get(0).turnNumber());

        // 3. Exchange Arguments
        List<MessageResponse> turn1Result = messageService.submitArgument(
                roomCode,
                "Artificial general intelligence poses unprecedented existential risks because misalignment with human values could lead to irreversible catastrophic harm."
        );

        assertEquals(2, turn1Result.size());
        assertEquals("HUMAN", turn1Result.get(0).senderType());
        assertEquals("AI", turn1Result.get(1).senderType());
        assertEquals(1, turn1Result.get(0).turnNumber());
        assertEquals(1, turn1Result.get(1).turnNumber());

        List<MessageResponse> allMessages = messageService.getMessages(roomCode);
        assertEquals(3, allMessages.size()); // MODERATOR + HUMAN + AI

        // 4. End Debate
        RoomResponse endedRoom = roomService.endRoom(roomCode);
        assertEquals("COMPLETED", endedRoom.status());
        assertNotNull(endedRoom.endedAt());

        // 5. Generate / Retrieve Evaluation
        EvaluationResponse evaluation = evaluationService.getEvaluation(roomCode);
        assertNotNull(evaluation);
        assertEquals(roomCode, evaluation.roomCode());
        assertTrue(evaluation.humanScore() >= 0 && evaluation.humanScore() <= 100);
        assertTrue(evaluation.aiScore() >= 0 && evaluation.aiScore() <= 100);
        assertNotNull(evaluation.winner());
        assertNotNull(evaluation.strongestArgument());
        assertNotNull(evaluation.judgeExplanation());

        // Verify criteria breakdown points are valid
        assertTrue(evaluation.logicalReasoningScore() <= 25);
        assertTrue(evaluation.argumentStrengthScore() <= 25);
        assertTrue(evaluation.rebuttalQualityScore() <= 20);
        assertTrue(evaluation.evidenceScore() <= 15);
        assertTrue(evaluation.clarityScore() <= 15);
    }
}
