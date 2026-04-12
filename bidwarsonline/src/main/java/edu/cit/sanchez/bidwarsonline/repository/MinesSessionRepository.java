package edu.cit.sanchez.bidwarsonline.repository;

import edu.cit.sanchez.bidwarsonline.entity.MinesSession;
import edu.cit.sanchez.bidwarsonline.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MinesSessionRepository extends JpaRepository<MinesSession, Long> {
    Optional<MinesSession> findByUserAndStatus(User user, MinesSession.SessionStatus status);
}
