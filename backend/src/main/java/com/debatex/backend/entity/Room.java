package com.debatex.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", indexes = {
    @Index(name = "idx_rooms_code", columnList = "roomCode", unique = true),
    @Index(name = "idx_rooms_status", columnList = "status")
})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 8)
    private String roomCode;

    @Column(nullable = false, length = 50)
    private String topicId;

    @Column(nullable = false, length = 500)
    private String topic;

    @Column(nullable = false, length = 150)
    private String category;

    @Column(nullable = false, length = 50)
    private String topicDifficulty;

    @Column(nullable = false, length = 50)
    private String aiDifficulty = "Expert";

    @Column(nullable = false, length = 50)
    private String status = "CREATED";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creator_id")
    private User creator;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public Room() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "CREATED";
        }
        if (this.aiDifficulty == null) {
            this.aiDifficulty = "Expert";
        }
    }

    public Long getId() { return id; }
    public String getRoomCode() { return roomCode; }
    public String getTopicId() { return topicId; }
    public String getTopic() { return topic; }
    public String getCategory() { return category; }
    public String getTopicDifficulty() { return topicDifficulty; }
    public String getAiDifficulty() { return aiDifficulty; }
    public String getStatus() { return status; }
    public User getCreator() { return creator; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }

    public void setId(Long id) { this.id = id; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }
    public void setTopicId(String topicId) { this.topicId = topicId; }
    public void setTopic(String topic) { this.topic = topic; }
    public void setCategory(String category) { this.category = category; }
    public void setTopicDifficulty(String topicDifficulty) { this.topicDifficulty = topicDifficulty; }
    public void setAiDifficulty(String aiDifficulty) { this.aiDifficulty = aiDifficulty; }
    public void setStatus(String status) { this.status = status; }
    public void setCreator(User creator) { this.creator = creator; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
