package com.debatex.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "debate_messages", indexes = {
    @Index(name = "idx_msg_room_id", columnList = "room_id"),
    @Index(name = "idx_msg_timestamp", columnList = "timestamp")
})
public class DebateMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 30)
    private String senderType; // HUMAN, AI, MODERATOR

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer turnNumber;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public DebateMessage() {}

    public DebateMessage(Room room, String senderType, String content, Integer turnNumber) {
        this.room = room;
        this.senderType = senderType;
        this.content = content;
        this.turnNumber = turnNumber;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public String getSenderType() { return senderType; }
    public String getContent() { return content; }
    public Integer getTurnNumber() { return turnNumber; }
    public LocalDateTime getTimestamp() { return timestamp; }

    public void setId(Long id) { this.id = id; }
    public void setRoom(Room room) { this.room = room; }
    public void setSenderType(String senderType) { this.senderType = senderType; }
    public void setContent(String content) { this.content = content; }
    public void setTurnNumber(Integer turnNumber) { this.turnNumber = turnNumber; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
