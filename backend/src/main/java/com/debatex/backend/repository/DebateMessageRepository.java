package com.debatex.backend.repository;

import com.debatex.backend.entity.DebateMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DebateMessageRepository extends JpaRepository<DebateMessage, Long> {
    List<DebateMessage> findByRoomIdOrderByTimestampAsc(Long roomId);
    List<DebateMessage> findByRoomRoomCodeOrderByTimestampAsc(String roomCode);
    long countByRoomId(Long roomId);
}
