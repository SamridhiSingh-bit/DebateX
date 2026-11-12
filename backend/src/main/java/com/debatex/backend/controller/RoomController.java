package com.debatex.backend.controller;

import com.debatex.backend.dto.CreateRoomRequest;
import com.debatex.backend.dto.RoomResponse;
import com.debatex.backend.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(roomService.getRooms(userEmail));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication) {

        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.createRoom(request, userEmail));
    }

    @GetMapping("/{code}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String code) {
        return ResponseEntity.ok(roomService.getRoom(code));
    }

    @PatchMapping("/{code}/start")
    public ResponseEntity<RoomResponse> startRoom(@PathVariable String code) {
        return ResponseEntity.ok(roomService.startRoom(code));
    }

    @PatchMapping("/{code}/end")
    public ResponseEntity<RoomResponse> endRoom(@PathVariable String code) {
        return ResponseEntity.ok(roomService.endRoom(code));
    }
}
