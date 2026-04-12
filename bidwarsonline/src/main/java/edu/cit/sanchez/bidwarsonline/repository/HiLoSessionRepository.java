package edu.cit.sanchez.bidwarsonline.repository;

import edu.cit.sanchez.bidwarsonline.entity.HiLoSession;
import edu.cit.sanchez.bidwarsonline.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HiLoSessionRepository extends JpaRepository<HiLoSession, Long> {
    Optional<HiLoSession> findByUserAndStatus(User user, HiLoSession.SessionStatus status);
}
