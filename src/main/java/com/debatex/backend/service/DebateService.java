package com.debatex.backend.service;

import com.debatex.backend.model.Debate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service 
public class DebateService {
    private final List<Debate> debates = new ArrayList<>();
    private long nextId = 1;

    public Debate createDebate(Debate debate) {
        debate.setId(nextId++);
        debate.setStatus("UPCOMING");
        debate.setParticipantCount(0);
        debates.add(debate);
        return debate;
    }
    public Optional<Debate> getDebateById(Long id) {
        return debates.stream()
                .filter(debate -> debate.getId().equals(id))
                .findFirst();
    }
}