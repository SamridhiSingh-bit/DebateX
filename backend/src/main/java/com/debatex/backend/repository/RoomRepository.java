package com.debatex.backend.repository;

import com.debatex.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
    List<Room> findByCreatorIdOrderByCreatedAtDesc(Long creatorId);
}
