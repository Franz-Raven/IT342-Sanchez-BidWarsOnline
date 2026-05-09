package edu.cit.sanchez.bidwarsonline.shared.repository;

import edu.cit.sanchez.bidwarsonline.shared.entity.Bonus; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long> {
    List<Bonus> findByUserId(Long userId);
    List<Bonus> findByUserIdAndClaimedFalse(Long userId);
}


