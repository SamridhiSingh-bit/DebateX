package com.debatex.backend.controller;

import com.debatex.backend.dto.EvaluationResponse;
import com.debatex.backend.service.DebateEvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms/{code}/evaluation")
public class DebateEvaluationController {

    private final DebateEvaluationService evaluationService;

    public DebateEvaluationController(DebateEvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping
    public ResponseEntity<EvaluationResponse> getEvaluation(@PathVariable String code) {
        return ResponseEntity.ok(evaluationService.getEvaluation(code));
    }

    @PostMapping
    public ResponseEntity<EvaluationResponse> generateEvaluation(@PathVariable String code) {
        return ResponseEntity.ok(evaluationService.generateEvaluation(code));
    }
}
