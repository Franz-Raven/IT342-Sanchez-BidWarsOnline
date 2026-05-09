package edu.cit.sanchez.bidwarsonline.features.hilo;

import edu.cit.sanchez.bidwarsonline.shared.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HiLoSessionRepository extends JpaRepository<HiLoSession, Long> {
    Optional<HiLoSession> findByUserAndStatus(User user, HiLoSession.SessionStatus status);
}




