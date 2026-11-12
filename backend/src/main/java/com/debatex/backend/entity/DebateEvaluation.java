package com.debatex.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "debate_evaluations", indexes = {
    @Index(name = "idx_eval_room_id", columnList = "room_id", unique = true)
})
public class DebateEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "room_id", nullable = false, unique = true)
    private Room room;

    @Column(nullable = false)
    private Integer humanScore; // 0-100

    @Column(nullable = false)
    private Integer aiScore; // 0-100

    @Column(nullable = false, length = 30)
    private String winner; // HUMAN, AI, TIE

    // Weighted criteria:
    // Logical reasoning: 25%
    @Column(nullable = false)
    private Integer logicalReasoningScore;

    // Argument strength: 25%
    @Column(nullable = false)
    private Integer argumentStrengthScore;

    // Rebuttal quality: 20%
    @Column(nullable = false)
    private Integer rebuttalQualityScore;

    // Evidence and examples: 15%
    @Column(nullable = false)
    private Integer evidenceScore;

    // Clarity and coherence: 15%
    @Column(nullable = false)
    private Integer clarityScore;

    @Column(columnDefinition = "TEXT")
    private String strongestArgument;

    @Column(columnDefinition = "TEXT")
    private String weakestArgument;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String weaknesses;

    @Column(columnDefinition = "TEXT")
    private String suggestions;

    @Column(columnDefinition = "TEXT")
    private String judgeExplanation;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DebateEvaluation() {}

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public Room getRoom() { return room; }
    public Integer getHumanScore() { return humanScore; }
    public Integer getAiScore() { return aiScore; }
    public String getWinner() { return winner; }
    public Integer getLogicalReasoningScore() { return logicalReasoningScore; }
    public Integer getArgumentStrengthScore() { return argumentStrengthScore; }
    public Integer getRebuttalQualityScore() { return rebuttalQualityScore; }
    public Integer getEvidenceScore() { return evidenceScore; }
    public Integer getClarityScore() { return clarityScore; }
    public String getStrongestArgument() { return strongestArgument; }
    public String getWeakestArgument() { return weakestArgument; }
    public String getStrengths() { return strengths; }
    public String getWeaknesses() { return weaknesses; }
    public String getSuggestions() { return suggestions; }
    public String getJudgeExplanation() { return judgeExplanation; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setRoom(Room room) { this.room = room; }
    public void setHumanScore(Integer humanScore) { this.humanScore = humanScore; }
    public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }
    public void setWinner(String winner) { this.winner = winner; }
    public void setLogicalReasoningScore(Integer logicalReasoningScore) { this.logicalReasoningScore = logicalReasoningScore; }
    public void setArgumentStrengthScore(Integer argumentStrengthScore) { this.argumentStrengthScore = argumentStrengthScore; }
    public void setRebuttalQualityScore(Integer rebuttalQualityScore) { this.rebuttalQualityScore = rebuttalQualityScore; }
    public void setEvidenceScore(Integer evidenceScore) { this.evidenceScore = evidenceScore; }
    public void setClarityScore(Integer clarityScore) { this.clarityScore = clarityScore; }
    public void setStrongestArgument(String strongestArgument) { this.strongestArgument = strongestArgument; }
    public void setWeakestArgument(String weakestArgument) { this.weakestArgument = weakestArgument; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    public void setSuggestions(String suggestions) { this.suggestions = suggestions; }
    public void setJudgeExplanation(String judgeExplanation) { this.judgeExplanation = judgeExplanation; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
