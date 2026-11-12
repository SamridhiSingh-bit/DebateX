package com.debatex.backend.service;

import com.debatex.backend.ai.AiModeratorService;
import com.debatex.backend.ai.AiOpponentService;
import com.debatex.backend.dto.MessageResponse;
import com.debatex.backend.entity.DebateMessage;
import com.debatex.backend.entity.Room;
import com.debatex.backend.repository.DebateMessageRepository;
import com.debatex.backend.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DebateMessageService {

    private final DebateMessageRepository messageRepository;
    private final RoomRepository roomRepository;
    private final AiOpponentService aiOpponentService;
    private final AiModeratorService aiModeratorService;

    public DebateMessageService(
            DebateMessageRepository messageRepository,
            RoomRepository roomRepository,
            AiOpponentService aiOpponentService,
            AiModeratorService aiModeratorService) {
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.aiOpponentService = aiOpponentService;
        this.aiModeratorService = aiModeratorService;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        return messageRepository.findByRoomIdOrderByTimestampAsc(room.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<MessageResponse> submitArgument(String roomCode, String userContent) {
        Room room = roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        if (!"IN_PROGRESS".equalsIgnoreCase(room.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Messages cannot be submitted. Room status is " + room.getStatus() + ". It must be IN_PROGRESS."
            );
        }

        String qualityIssue = aiModeratorService.checkRelevanceAndQuality(room.getTopic(), userContent);
        if (qualityIssue != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, qualityIssue);
        }

        List<DebateMessage> existingMessages = messageRepository.findByRoomIdOrderByTimestampAsc(room.getId());

        long humanTurns = existingMessages.stream()
                .filter(m -> "HUMAN".equalsIgnoreCase(m.getSenderType()))
                .count();

        int currentTurn = (int) humanTurns + 1;

        // 1. Save Human Message
        DebateMessage humanMessage = new DebateMessage();
        humanMessage.setRoom(room);
        humanMessage.setSenderType("HUMAN");
        humanMessage.setContent(userContent.trim());
        humanMessage.setTurnNumber(currentTurn);
        humanMessage.setTimestamp(LocalDateTime.now());
        DebateMessage savedHumanMsg = messageRepository.save(humanMessage);

        // 2. Generate AI Opponent Counterargument
        String aiResponseText = aiOpponentService.generateCounterargument(room, existingMessages, userContent.trim());

        // 3. Save AI Message
        DebateMessage aiMessage = new DebateMessage();
        aiMessage.setRoom(room);
        aiMessage.setSenderType("AI");
        aiMessage.setContent(aiResponseText);
        aiMessage.setTurnNumber(currentTurn);
        aiMessage.setTimestamp(LocalDateTime.now().plusNanos(1000));
        DebateMessage savedAiMsg = messageRepository.save(aiMessage);

        List<MessageResponse> result = new ArrayList<>();
        result.add(toResponse(savedHumanMsg));
        result.add(toResponse(savedAiMsg));
        return result;
    }

    @Transactional
    public void postModeratorOpening(Room room) {
        String intro = aiModeratorService.generateOpeningStatement(room);

        DebateMessage moderatorMessage = new DebateMessage();
        moderatorMessage.setRoom(room);
        moderatorMessage.setSenderType("MODERATOR");
        moderatorMessage.setContent(intro);
        moderatorMessage.setTurnNumber(0);
        moderatorMessage.setTimestamp(LocalDateTime.now());

        messageRepository.save(moderatorMessage);
    }

    public MessageResponse toResponse(DebateMessage msg) {
        return new MessageResponse(
                msg.getId(),
                msg.getSenderType(),
                msg.getContent(),
                msg.getTurnNumber(),
                msg.getTimestamp()
        );
    }
}
