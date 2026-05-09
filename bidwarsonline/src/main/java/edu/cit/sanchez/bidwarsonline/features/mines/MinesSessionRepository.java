package edu.cit.sanchez.bidwarsonline.features.mines;

import edu.cit.sanchez.bidwarsonline.features.mines.MinesSession;
import edu.cit.sanchez.bidwarsonline.shared.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MinesSessionRepository extends JpaRepository<MinesSession, Long> {
    Optional<MinesSession> findByUserAndStatus(User user, MinesSession.SessionStatus status);
}





