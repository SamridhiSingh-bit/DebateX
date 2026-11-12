package com.debatex.backend.service;

import com.debatex.backend.dto.AuthResponse;
import com.debatex.backend.dto.LoginRequest;
import com.debatex.backend.dto.RegisterRequest;
import com.debatex.backend.dto.UserResponse;
import com.debatex.backend.entity.User;
import com.debatex.backend.repository.UserRepository;
import com.debatex.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User(
                request.name().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                "ROLE_USER"
        );

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser.getEmail());

        return new AuthResponse(token, savedUser.getId(), savedUser.getName(), savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().toLowerCase().trim();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }

    public Optional<User> findUserByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.toLowerCase().trim());
    }
}
