package com.debatex.backend.repository;

import com.debatex.backend.entity.DebateEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DebateEvaluationRepository extends JpaRepository<DebateEvaluation, Long> {
    Optional<DebateEvaluation> findByRoomId(Long roomId);
    Optional<DebateEvaluation> findByRoomRoomCode(String roomCode);
    boolean existsByRoomRoomCode(String roomCode);
}
