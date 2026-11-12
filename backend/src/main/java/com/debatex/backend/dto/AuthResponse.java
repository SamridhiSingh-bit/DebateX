package com.debatex.backend.dto;

public record AuthResponse(
    String token,
    String type,
    Long id,
    String name,
    String email
) {
    public AuthResponse(String token, Long id, String name, String email) {
        this(token, "Bearer", id, name, email);
    }
}
