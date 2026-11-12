package com.debatex.backend.service;

import com.debatex.backend.ai.AiJudgeService;
import com.debatex.backend.dto.EvaluationResponse;
import com.debatex.backend.entity.DebateEvaluation;
import com.debatex.backend.entity.DebateMessage;
import com.debatex.backend.entity.Room;
import com.debatex.backend.repository.DebateEvaluationRepository;
import com.debatex.backend.repository.DebateMessageRepository;
import com.debatex.backend.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DebateEvaluationService {

    private final DebateEvaluationRepository evaluationRepository;
    private final DebateMessageRepository messageRepository;
    private final RoomRepository roomRepository;
    private final AiJudgeService aiJudgeService;

    public DebateEvaluationService(
            DebateEvaluationRepository evaluationRepository,
            DebateMessageRepository messageRepository,
            RoomRepository roomRepository,
            AiJudgeService aiJudgeService) {
        this.evaluationRepository = evaluationRepository;
        this.messageRepository = messageRepository;
        this.roomRepository = roomRepository;
        this.aiJudgeService = aiJudgeService;
    }

    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluation(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        DebateEvaluation evaluation = evaluationRepository.findByRoomId(room.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evaluation not found for room " + roomCode));

        return toResponse(evaluation);
    }

    @Transactional
    public EvaluationResponse generateEvaluation(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));

        // If evaluation already exists, return it
        var existing = evaluationRepository.findByRoomId(room.getId());
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        List<DebateMessage> messages = messageRepository.findByRoomIdOrderByTimestampAsc(room.getId());

        DebateEvaluation evaluation = aiJudgeService.evaluateDebate(room, messages);
        DebateEvaluation saved = evaluationRepository.save(evaluation);

        return toResponse(saved);
    }

    public EvaluationResponse toResponse(DebateEvaluation eval) {
        return new EvaluationResponse(
                eval.getId(),
                eval.getRoom().getRoomCode(),
                eval.getHumanScore(),
                eval.getAiScore(),
                eval.getWinner(),
                eval.getLogicalReasoningScore(),
                eval.getArgumentStrengthScore(),
                eval.getRebuttalQualityScore(),
                eval.getEvidenceScore(),
                eval.getClarityScore(),
                eval.getStrongestArgument(),
                eval.getWeakestArgument(),
                eval.getStrengths(),
                eval.getWeaknesses(),
                eval.getSuggestions(),
                eval.getJudgeExplanation(),
                eval.getCreatedAt()
        );
    }
}
