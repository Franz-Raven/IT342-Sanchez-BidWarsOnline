package edu.cit.sanchez.bidwarsonline.service;

import edu.cit.sanchez.bidwarsonline.dto.PlaceBetResponse;
import edu.cit.sanchez.bidwarsonline.entity.BetRecord;
import edu.cit.sanchez.bidwarsonline.entity.User;
import edu.cit.sanchez.bidwarsonline.entity.Wallet;
import edu.cit.sanchez.bidwarsonline.repository.BetRecordRepository;
import edu.cit.sanchez.bidwarsonline.repository.UserRepository;
import edu.cit.sanchez.bidwarsonline.repository.WalletRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PlinkoService {

    private static final SecureRandom secureRandom = new SecureRandom();
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BetRecordRepository betRecordRepository;
    private final GameEngineService gameEngineService;
    private final SimpMessagingTemplate messagingTemplate;

    public PlinkoService(UserRepository userRepository,
                         WalletRepository walletRepository,
                         BetRecordRepository betRecordRepository,
                         GameEngineService gameEngineService,
                         SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.betRecordRepository = betRecordRepository;
        this.gameEngineService = gameEngineService;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public PlaceBetResponse placeBet(Long userId, BigDecimal betAmount, String risk) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

        if (wallet.getBalance().compareTo(betAmount) < 0) {
            throw new RuntimeException("Insufficient balance. Available: " + wallet.getBalance() + ", Required: " + betAmount);
        }

        BigDecimal newBalance = wallet.getBalance().subtract(betAmount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        final int FIXED_ROWS = 14;
        BallDropResult ballDropResult = simulateBallDropWithPath(FIXED_ROWS);
        BigDecimal resultMultiplier = getMultiplierForBucket(ballDropResult.getFinalBucket(), risk);
        BigDecimal payout = gameEngineService.calculatePayout(betAmount, resultMultiplier);

        newBalance = wallet.getBalance().add(payout);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        String transactionId = generateTransactionId();
        String gameData = String.format("{\"gameType\":\"PLINKO\",\"risk\":\"%s\",\"timestamp\":\"%s\"}", risk, LocalDateTime.now());
        String status = payout.compareTo(BigDecimal.ZERO) > 0 ? "WIN" : "LOSS";

        BetRecord betRecord = new BetRecord(user, "PLINKO", betAmount, resultMultiplier, payout, gameData, status);
        betRecordRepository.save(betRecord);

        broadcastBalanceUpdate(user.getId(), newBalance);

        return new PlaceBetResponse(transactionId, resultMultiplier, payout, newBalance, 
                                    ballDropResult.getFinalBucket(), ballDropResult.getPath());
    }

    private BallDropResult simulateBallDropWithPath(Integer rows) {
        int position = 0;
        java.util.List<String> path = new java.util.ArrayList<>();
        
        for (int i = 0; i < rows; i++) {
            int direction = secureRandom.nextInt(2);
            position += direction;
            path.add(direction == 0 ? "L" : "R");
        }
        
        return new BallDropResult(position, path);
    }

    private BigDecimal getMultiplierForBucket(int bucketPosition, String risk) {
        double[] multipliers = getMultipliersForRisk(risk);
        int index = Math.min(bucketPosition, multipliers.length - 1);
        double multiplier = multipliers[index];
        return BigDecimal.valueOf(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    private double[] getMultipliersForRisk(String risk) {
        if (risk == null) {
            risk = "MEDIUM";
        }

        switch (risk.toUpperCase()) {
            case "LOW":
                return new double[] {18.0, 3.2, 1.6, 1.3, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.3, 1.6, 3.2, 18.0};
            case "HIGH":
                return new double[] {353.0, 49.0, 14.0, 5.3, 2.1, 0.5, 0.2, 0.0, 0.2, 0.5, 2.1, 5.3, 14.0, 49.0, 353.0};
            case "MEDIUM":
            default:
                return new double[] {55.0, 12.0, 5.6, 3.2, 1.6, 1.0, 0.7, 0.2, 0.7, 1.0, 1.6, 3.2, 5.6, 12.0, 55.0};
        }
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void broadcastBalanceUpdate(Long userId, BigDecimal newBalance) {
        try {
            var walletUpdate = new WalletUpdateMessage(userId, newBalance);
            messagingTemplate.convertAndSendToUser(userId.toString(), "/topic/wallet", walletUpdate);
        } catch (Exception e) {
            System.err.println("Failed to broadcast WebSocket update: " + e.getMessage());
        }
    }

    public static class WalletUpdateMessage {
        private Long userId;
        private BigDecimal balance;
        private LocalDateTime timestamp;

        public WalletUpdateMessage(Long userId, BigDecimal balance) {
            this.userId = userId;
            this.balance = balance;
            this.timestamp = LocalDateTime.now();
        }

        public Long getUserId() {
            return userId;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }

    private static class BallDropResult {
        private final int finalBucket;
        private final java.util.List<String> path;

        public BallDropResult(int finalBucket, java.util.List<String> path) {
            this.finalBucket = finalBucket;
            this.path = path;
        }

        public int getFinalBucket() {
            return finalBucket;
        }

        public java.util.List<String> getPath() {
            return path;
        }
    }
}
