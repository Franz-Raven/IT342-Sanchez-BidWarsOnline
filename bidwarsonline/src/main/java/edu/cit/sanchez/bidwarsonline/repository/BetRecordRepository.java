package edu.cit.sanchez.bidwarsonline;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BetRecordRepository extends JpaRepository<BetRecord, Long> {
    List<BetRecord> findByUserId(Long userId);
    List<BetRecord> findByGameType(String gameType);
}