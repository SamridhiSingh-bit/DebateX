package com.debatex.backend.controller;

import com.debatex.backend.dto.MessageResponse;
import com.debatex.backend.dto.SendMessageRequest;
import com.debatex.backend.service.DebateMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms/{code}/messages")
public class DebateMessageController {

    private final DebateMessageService messageService;

    public DebateMessageController(DebateMessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable String code) {
        return ResponseEntity.ok(messageService.getMessages(code));
    }

    @PostMapping
    public ResponseEntity<List<MessageResponse>> sendMessage(
            @PathVariable String code,
            @Valid @RequestBody SendMessageRequest request) {

        return ResponseEntity.ok(messageService.submitArgument(code, request.content()));
    }
}
