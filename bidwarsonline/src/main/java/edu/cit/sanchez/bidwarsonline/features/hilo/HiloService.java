package edu.cit.sanchez.bidwarsonline.features.hilo;

import edu.cit.sanchez.bidwarsonline.features.hilo.dto.HiloResponse;
import edu.cit.sanchez.bidwarsonline.features.hilo.util.HiLoMathUtil;
import edu.cit.sanchez.bidwarsonline.shared.entity.BetRecord;
import edu.cit.sanchez.bidwarsonline.shared.entity.User;
import edu.cit.sanchez.bidwarsonline.features.wallet.Wallet;
import edu.cit.sanchez.bidwarsonline.shared.repository.BetRecordRepository;
import edu.cit.sanchez.bidwarsonline.shared.repository.UserRepository;
import edu.cit.sanchez.bidwarsonline.features.wallet.WalletRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HiloService {

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String[] SUITS = {"hearts", "diamonds", "clubs", "spades"};
    private static final BigDecimal MAX_PAYOUT = new BigDecimal("1000000000.00");
    
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BetRecordRepository betRecordRepository;
    private final HiLoSessionRepository sessionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public HiloService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       BetRecordRepository betRecordRepository,
                       HiLoSessionRepository sessionRepository,
                       SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.betRecordRepository = betRecordRepository;
        this.sessionRepository = sessionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public HiloResponse startGame(Long userId, BigDecimal betAmount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));

        if (wallet.getBalance().compareTo(betAmount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        Optional<HiLoSession> existingSession = sessionRepository.findByUserAndStatus(user, HiLoSession.SessionStatus.ACTIVE);
        if (existingSession.isPresent()) {
            throw new RuntimeException("You already have an active game. Please cash out or finish it first.");
        }

        BigDecimal newBalance = wallet.getBalance().subtract(betAmount);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        int initialCardRank = drawCardRank();
        HiLoSession session = new HiLoSession(user, betAmount, betAmount, initialCardRank);
        session = sessionRepository.save(session);

        broadcastBalanceUpdate(userId, newBalance);

        HiloResponse response = new HiloResponse();
        response.setSessionId(session.getId());
        response.setCurrentCardRank(HiLoMathUtil.rankToString(initialCardRank));
        response.setCurrentCardSuit(getRandomSuit());
        response.setCurrentCardValue(initialCardRank);
        response.setCurrentPot(betAmount);
        response.setStreakCount(0);
        response.setHigherProbability(HiLoMathUtil.calculateProbability(initialCardRank, "HIGHER"));
        response.setLowerProbability(HiLoMathUtil.calculateProbability(initialCardRank, "LOWER"));
        response.setNewBalance(newBalance);
        response.setStatus("ACTIVE");
        return response;
    }

    @Transactional
    public HiloResponse makeGuess(Long sessionId, String prediction) {
        HiLoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != HiLoSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not active");
        }

        int currentCard = session.getCurrentCardRank();
        int nextCard = drawCardRank();

        boolean isCorrect = checkGuess(currentCard, nextCard, prediction);

        if (!isCorrect) {
            session.setStatus(HiLoSession.SessionStatus.BUSTED);
            session.setCurrentPot(BigDecimal.ZERO);
            sessionRepository.save(session);

            User user = session.getUser();
            Wallet wallet = walletRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            String transactionId = generateTransactionId();
            String gameData = String.format("{\"gameType\":\"HILO\",\"result\":\"BUST\",\"timestamp\":\"%s\"}", LocalDateTime.now());
            BetRecord betRecord = new BetRecord(user, "HILO", session.getInitialBetAmount(), BigDecimal.ZERO, BigDecimal.ZERO, gameData, "LOSS");
            betRecordRepository.save(betRecord);

            HiloResponse response = new HiloResponse();
            response.setSessionId(session.getId());
            response.setCurrentCardRank(HiLoMathUtil.rankToString(nextCard));
            response.setCurrentCardSuit(getRandomSuit());
            response.setCurrentCardValue(nextCard);
            response.setCurrentPot(BigDecimal.ZERO);
            response.setStreakCount(session.getStreakCount());
            response.setIsCorrect(false);
            response.setIsBust(true);
            response.setNewBalance(wallet.getBalance());
            response.setStatus("BUSTED");
            return response;
        }

        double probability = HiLoMathUtil.calculateProbability(currentCard, prediction);
        BigDecimal multiplier = HiLoMathUtil.calculateMultiplier(probability, session.getStreakCount());
        BigDecimal newPot = session.getCurrentPot().multiply(multiplier).setScale(2, RoundingMode.HALF_UP);

        session.setCurrentPot(newPot);
        session.setCurrentCardRank(nextCard);
        session.setStreakCount(session.getStreakCount() + 1);

        if (newPot.compareTo(MAX_PAYOUT) >= 0) {
            return autoCashOut(session);
        }

        sessionRepository.save(session);

        HiloResponse response = new HiloResponse();
        response.setSessionId(session.getId());
        response.setCurrentCardRank(HiLoMathUtil.rankToString(nextCard));
        response.setCurrentCardSuit(getRandomSuit());
        response.setCurrentCardValue(nextCard);
        response.setCurrentPot(newPot);
        response.setStreakCount(session.getStreakCount());
        response.setHigherProbability(HiLoMathUtil.calculateProbability(nextCard, "HIGHER"));
        response.setLowerProbability(HiLoMathUtil.calculateProbability(nextCard, "LOWER"));
        response.setIsCorrect(true);
        response.setNewBalance(walletRepository.findByUser(session.getUser()).get().getBalance());
        response.setStatus("ACTIVE");
        return response;
    }

    @Transactional
    public HiloResponse cashOut(Long sessionId) {
        HiLoSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getStatus() != HiLoSession.SessionStatus.ACTIVE) {
            throw new RuntimeException("Session is not active");
        }

        User user = session.getUser();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        BigDecimal payout = session.getCurrentPot();
        BigDecimal newBalance = wallet.getBalance().add(payout);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        session.setStatus(HiLoSession.SessionStatus.CASHED_OUT);
        sessionRepository.save(session);

        String transactionId = generateTransactionId();
        BigDecimal profit = payout.subtract(session.getInitialBetAmount());
        BigDecimal multiplier = session.getInitialBetAmount().compareTo(BigDecimal.ZERO) > 0
                ? payout.divide(session.getInitialBetAmount(), 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        String gameData = String.format("{\"gameType\":\"HILO\",\"streak\":%d,\"timestamp\":\"%s\"}",
                session.getStreakCount(), LocalDateTime.now());
        String status = profit.compareTo(BigDecimal.ZERO) > 0 ? "WIN" : "LOSS";
        BetRecord betRecord = new BetRecord(user, "HILO", session.getInitialBetAmount(), multiplier, payout, gameData, status);
        betRecordRepository.save(betRecord);

        broadcastBalanceUpdate(user.getId(), newBalance);

        HiloResponse response = new HiloResponse();
        response.setSessionId(session.getId());
        response.setCurrentPot(payout);
        response.setFinalPayout(payout);
        response.setStreakCount(session.getStreakCount());
        response.setNewBalance(newBalance);
        response.setStatus("CASHED_OUT");
        return response;
    }

    private HiloResponse autoCashOut(HiLoSession session) {
        session.setCurrentPot(MAX_PAYOUT);
        sessionRepository.save(session);
        return cashOut(session.getId());
    }

    private boolean checkGuess(int currentCard, int nextCard, String guess) {
        if (currentCard == nextCard) {
            return false;
        }

        if ("HIGHER".equalsIgnoreCase(guess)) {
            return nextCard > currentCard;
        } else if ("LOWER".equalsIgnoreCase(guess)) {
            return nextCard < currentCard;
        }

        throw new IllegalArgumentException("Invalid guess: " + guess);
    }

    private int drawCardRank() {
        return secureRandom.nextInt(13) + 2;
    }

    private String getRandomSuit() {
        return SUITS[secureRandom.nextInt(SUITS.length)];
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

    public HiloResponse getActiveSession(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<HiLoSession> sessionOpt = sessionRepository.findByUserAndStatus(user, HiLoSession.SessionStatus.ACTIVE);
        
        if (sessionOpt.isEmpty()) {
            return null;
        }

        HiLoSession session = sessionOpt.get();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        int currentCardRank = session.getCurrentCardRank();

        HiloResponse response = new HiloResponse();
        response.setSessionId(session.getId());
        response.setCurrentCardRank(HiLoMathUtil.rankToString(currentCardRank));
        response.setCurrentCardSuit(getRandomSuit());
        response.setCurrentCardValue(currentCardRank);
        response.setStreakCount(session.getStreakCount());
        response.setCurrentPot(session.getCurrentPot());
        response.setHigherProbability(HiLoMathUtil.calculateProbability(currentCardRank, "HIGHER"));
        response.setLowerProbability(HiLoMathUtil.calculateProbability(currentCardRank, "LOWER"));
        response.setNewBalance(wallet.getBalance());
        response.setStatus("ACTIVE");
        response.setBetAmount(session.getInitialBetAmount());
        return response;
    }
}




