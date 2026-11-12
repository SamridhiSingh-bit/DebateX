package com.debatex.backend.dto;

public record TopicDto(
    String id,
    String title,
    String category,
    String difficulty,
    boolean enabled,
    String collection
) {}
