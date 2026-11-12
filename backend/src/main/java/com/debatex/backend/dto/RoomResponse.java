package com.debatex.backend.dto;

import java.time.LocalDateTime;

public record RoomResponse(
    Long id,
    String roomCode,
    String topicId,
    String topic,
    String category,
    String topicDifficulty,
    String aiDifficulty,
    String status,
    String creatorEmail,
    LocalDateTime createdAt,
    LocalDateTime startedAt,
    LocalDateTime endedAt
) {}
