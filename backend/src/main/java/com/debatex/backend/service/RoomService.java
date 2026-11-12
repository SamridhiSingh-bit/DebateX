package com.debatex.backend.service;

import com.debatex.backend.dto.CreateRoomRequest;
import com.debatex.backend.dto.RoomResponse;
import com.debatex.backend.dto.TopicDto;
import com.debatex.backend.entity.Room;
import com.debatex.backend.entity.User;
import com.debatex.backend.repository.RoomRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RoomRepository roomRepository;
    private final TopicService topicService;
    private final AuthService authService;
    private final DebateMessageService messageService;
    private final DebateEvaluationService evaluationService;

    public RoomService(
            RoomRepository roomRepository,
            TopicService topicService,
            AuthService authService,
            @Lazy DebateMessageService messageService,
            @Lazy DebateEvaluationService evaluationService) {
        this.roomRepository = roomRepository;
        this.topicService = topicService;
        this.authService = authService;
        this.messageService = messageService;
        this.evaluationService = evaluationService;
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request, String userEmail) {
        // Validate topicId against authoritative curated topic library
        TopicDto curatedTopic = topicService.getTopicById(request.topicId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid topic ID: " + request.topicId() + ". Topic must belong to the curated topic library."
                ));

        if (!curatedTopic.enabled()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Topic " + request.topicId() + " is currently disabled."
            );
        }

        Room room = new Room();

        // Generate clean 6-character room code avoiding ambiguous characters
        String code;
        int attempts = 0;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            code = sb.toString();
            attempts++;
            if (attempts > 100) {
                code = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            }
        } while (roomRepository.existsByRoomCode(code));

        room.setRoomCode(code);
        room.setTopicId(curatedTopic.id());
        room.setTopic(curatedTopic.title());
        room.setCategory(curatedTopic.category());
        room.setTopicDifficulty(curatedTopic.difficulty());
        room.setAiDifficulty(request.aiDifficulty() != null ? request.aiDifficulty() : "Expert");
        room.setStatus("CREATED");

        if (userEmail != null) {
            authService.findUserByEmail(userEmail).ifPresent(room::setCreator);
        }

        Room saved = roomRepository.save(room);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Room findRoomEntity(String code) {
        return roomRepository.findByRoomCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Room not found with code: " + code
                ));
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoom(String code) {
        return toResponse(findRoomEntity(code));
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(String userEmail) {
        if (userEmail != null) {
            User user = authService.findUserByEmail(userEmail).orElse(null);
            if (user != null) {
                return roomRepository.findByCreatorIdOrderByCreatedAtDesc(user.getId())
                        .stream()
                        .map(this::toResponse)
                        .toList();
            }
        }
        return roomRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public RoomResponse startRoom(String code) {
        Room room = findRoomEntity(code);

        if ("IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            // Already started; idempotent return
            return toResponse(room);
        }

        if (!"CREATED".equalsIgnoreCase(room.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Room cannot be started because status is: " + room.getStatus()
            );
        }

        room.setStatus("IN_PROGRESS");
        room.setStartedAt(LocalDateTime.now());
        Room saved = roomRepository.save(room);

        // AI Moderator posts the opening statement and rules
        try {
            messageService.postModeratorOpening(saved);
        } catch (Exception e) {
            // Log warning but don't abort room start
        }

        return toResponse(saved);
    }

    @Transactional
    public RoomResponse endRoom(String code) {
        Room room = findRoomEntity(code);

        if ("COMPLETED".equalsIgnoreCase(room.getStatus())) {
            // Already ended; idempotent return
            return toResponse(room);
        }

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Room is not in progress. Current status: " + room.getStatus()
            );
        }

        room.setStatus("COMPLETED");
        room.setEndedAt(LocalDateTime.now());
        Room saved = roomRepository.save(room);

        // Generate AI judge evaluation upon debate completion
        try {
            evaluationService.generateEvaluation(code);
        } catch (Exception e) {
            // Evaluation can also be generated on demand via evaluation endpoint
        }

        return toResponse(saved);
    }

    public RoomResponse toResponse(Room room) {
        return new RoomResponse(
                room.getId(),
                room.getRoomCode(),
                room.getTopicId(),
                room.getTopic(),
                room.getCategory(),
                room.getTopicDifficulty(),
                room.getAiDifficulty(),
                room.getStatus(),
                room.getCreator() != null ? room.getCreator().getEmail() : null,
                room.getCreatedAt(),
                room.getStartedAt(),
                room.getEndedAt()
        );
    }
}
