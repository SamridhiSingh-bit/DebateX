
package com.debatex.backend.controller;

import com.debatex.backend.model.Debate;
import com.debatex.backend.service.DebateService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debates")
public class DebateController {

    private final DebateService debateService;

    public DebateController(DebateService debateService) {
        this.debateService = debateService;
    }

    @PostMapping
    public ResponseEntity<Debate> createDebate(
            @RequestBody Debate debate) {

        Debate createdDebate =
                debateService.createDebate(debate);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdDebate);
    }

    @GetMapping
    public List<Debate> getAllDebates() {
        return debateService.getAllDebates();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Debate> getDebateById(
            @PathVariable Long id) {

        return debateService.getDebateById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
