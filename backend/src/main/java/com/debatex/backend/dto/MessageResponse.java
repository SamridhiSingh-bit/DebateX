package com.debatex.backend.dto;

import java.time.LocalDateTime;

public record MessageResponse(
    Long id,
    String senderType,
    String content,
    Integer turnNumber,
    LocalDateTime timestamp
) {}
