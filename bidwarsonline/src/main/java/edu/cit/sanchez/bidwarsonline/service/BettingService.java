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
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * BettingService handles the core betting logic with ACID compliance.
 * 
 * This service ensures that:
 * 1. User has sufficient balance
 * 2. Bet amount is deducted atomically
 * 3. Game outcome is calculated
 * 4. Payout is credited atomically
 * 5. Bet record is persisted
 * 6. Real-time update is pushed via WebSocket
 */
@Service
public class BettingService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BetRecordRepository betRecordRepository;
    private final GameEngineService gameEngineService;
    private final SimpMessagingTemplate messagingTemplate;

    public BettingService(UserRepository userRepository,
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

    /**
     * Execute a betting round with full ACID compliance.
     * 
     * ATOMIC FLOW:
     * 1. Fetch user and wallet (with pessimistic locking via @Transactional)
     * 2. Validate sufficient balance
     * 3. Deduct bet amount
     * 4. Calculate game outcome
     * 5. Credit payout
     * 6. Create BetRecord
     * 7. Persist all changes
     * 8. Broadcast WebSocket update
     * 
     * @param userId the ID of the user placing the bet
     * @param gameType the type of game (PLINKO, MINES, HI_LO)
     * @param betAmount the amount to wager
     * @param risk the risk level (LOW, MEDIUM, HIGH)
     * @param rows the configuration for the game
     * @return PlaceBetResponse with transaction details
     * @throws RuntimeException if validation fails
     */
    @Transactional
    public PlaceBetResponse placeBet(Long userId, String gameType, BigDecimal betAmount, String risk, Integer rows) {
        // Step 1: Fetch user and wallet
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

        // Step 2: Validate sufficient balance
        if (wallet.getBalance().compareTo(betAmount) < 0) {
            throw new RuntimeException("Insufficient balance. Available: " + wallet.getBalance() + ", Required: " + betAmount);
        }

        // Step 3: Deduct bet amount from wallet
        BigDecimal newBalance = wallet.getBalance().subtract(betAmount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        // Step 4: Calculate game outcome based on game type
        BigDecimal resultMultiplier = calculateGameOutcome(gameType, betAmount, risk, rows);

        // Step 5: Calculate payout
        BigDecimal payout = gameEngineService.calculatePayout(betAmount, resultMultiplier);

        // Step 6: Credit payout to wallet
        newBalance = wallet.getBalance().add(payout);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        // Step 7: Create and persist BetRecord
        String transactionId = generateTransactionId();
        String gameData = generateGameData(gameType, risk, rows);
        String status = payout.compareTo(BigDecimal.ZERO) > 0 ? "WIN" : "LOSS";

        BetRecord betRecord = new BetRecord(
                user,
                gameType,
                betAmount,
                resultMultiplier,
                payout,
                gameData,
                status
        );
        betRecordRepository.save(betRecord);

        // Step 8: Broadcast WebSocket update
        broadcastBalanceUpdate(user.getId(), newBalance);

        // Return response
        return new PlaceBetResponse(
                transactionId,
                resultMultiplier,
                payout,
                newBalance
        );
    }

    /**
     * Calculate game outcome based on game type.
     * Routes to appropriate game engine method.
     * 
     * @param gameType the game type
     * @param betAmount the bet amount
     * @param risk the risk level
     * @param rows the game configuration
     * @return the result multiplier
     */
    private BigDecimal calculateGameOutcome(String gameType, BigDecimal betAmount, String risk, Integer rows) {
        if (gameType == null || gameType.isEmpty()) {
            throw new RuntimeException("Game type cannot be null or empty");
        }

        switch (gameType.toUpperCase()) {
            case "PLINKO":
                return gameEngineService.calculatePlinkoMultiplier(betAmount, risk, rows);
            case "MINES":
                // TODO: Implement Mines logic
                throw new RuntimeException("Mines game not yet implemented");
            case "HI_LO":
                // TODO: Implement Hi-Lo logic
                throw new RuntimeException("Hi-Lo game not yet implemented");
            default:
                throw new RuntimeException("Unknown game type: " + gameType);
        }
    }

    /**
     * Generate a unique transaction ID for auditing.
     * 
     * @return transaction ID (TXN-XXXXXXXX format)
     */
    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Generate game data JSON string for auditing and fairness verification.
     * 
     * @param gameType the game type
     * @param risk the risk level
     * @param rows the configuration
     * @return JSON string representation of game data
     */
    private String generateGameData(String gameType, String risk, Integer rows) {
        // Simple JSON string; could use Jackson for more robust serialization
        return String.format(
                "{\"gameType\":\"%s\",\"risk\":\"%s\",\"rows\":%d,\"timestamp\":\"%s\"}",
                gameType,
                risk,
                rows,
                LocalDateTime.now()
        );
    }

    /**
     * Broadcast the updated wallet balance to the user via WebSocket.
     * 
     * Message is sent to the topic: /topic/wallet/{userId}
     * 
     * @param userId the user ID
     * @param newBalance the updated balance
     */
    private void broadcastBalanceUpdate(Long userId, BigDecimal newBalance) {
        try {
            WalletUpdateMessage walletUpdate = new WalletUpdateMessage(userId, newBalance);
            messagingTemplate.convertAndSend("/topic/wallet/" + userId, walletUpdate);
        } catch (Exception e) {
            // Log error but do not fail the transaction
            System.err.println("Failed to broadcast WebSocket update: " + e.getMessage());
        }
    }

    /**
     * DTO for WebSocket wallet update messages.
     */
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

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public void setBalance(BigDecimal balance) {
            this.balance = balance;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
