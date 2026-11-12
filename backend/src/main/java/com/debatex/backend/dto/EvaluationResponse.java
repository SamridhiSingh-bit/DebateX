package com.debatex.backend.dto;

import java.time.LocalDateTime;

public record EvaluationResponse(
    Long id,
    String roomCode,
    Integer humanScore,
    Integer aiScore,
    String winner,
    Integer logicalReasoningScore,
    Integer argumentStrengthScore,
    Integer rebuttalQualityScore,
    Integer evidenceScore,
    Integer clarityScore,
    String strongestArgument,
    String weakestArgument,
    String strengths,
    String weaknesses,
    String suggestions,
    String judgeExplanation,
    LocalDateTime createdAt
) {}
