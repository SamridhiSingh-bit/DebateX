package com.debatex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRoomRequest(
    @NotBlank(message = "topicId is required")
    String topicId,

    @NotBlank(message = "topic title is required")
    @Size(max = 500)
    String topic,

    @NotBlank(message = "category is required")
    String category,

    @NotBlank(message = "topicDifficulty is required")
    String topicDifficulty,

    @NotBlank(message = "aiDifficulty is required")
    @Pattern(regexp = "Beginner|Intermediate|Expert", message = "aiDifficulty must be Beginner, Intermediate, or Expert")
    String aiDifficulty
) {}
