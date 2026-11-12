package com.debatex.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SendMessageRequest(
    @NotBlank(message = "Content cannot be empty")
    @Size(max = 3000, message = "Message cannot exceed 3000 characters")
    String content
) {}
