package edu.cit.sanchez.bidwarsonline.repository;

import edu.cit.sanchez.bidwarsonline.entity.Wallet;
import edu.cit.sanchez.bidwarsonline.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);
    Optional<Wallet> findByUser(User user);
}