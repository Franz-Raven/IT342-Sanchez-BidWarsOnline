package edu.cit.sanchez.bidwarsonline.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.sanchez.bidwarsonline.dto.MinesResponse;
import edu.cit.sanchez.bidwarsonline.entity.*;
import edu.cit.sanchez.bidwarsonline.repository.*;
import edu.cit.sanchez.bidwarsonline.util.MinesMathUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class MinesService {

    private final MinesSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final BetRecordRepository betRecordRepository;
    private final ObjectMapper objectMapper;

    public MinesService(MinesSessionRepository sessionRepository,
                        UserRepository userRepository,
                        WalletRepository walletRepository,
                        BetRecordRepository betRecordRepository,
                        ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.betRecordRepository = betRecordRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public MinesResponse startGame(String userId, BigDecimal betAmount, int minesCount) {
        if (minesCount < 1 || minesCount > 24) {
            throw new IllegalArgumentException("Mines count must be between 1 and 24");
        }

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        if (wallet.getBalance().compareTo(betAmount) < 0) {
            throw new IllegalArgumentException("Insufficient balance");
        }

        Optional<MinesSession> existingSession = sessionRepository.findByUserAndStatus(user, MinesSession.SessionStatus.ACTIVE);
        if (existingSession.isPresent()) {
            throw new IllegalArgumentException("You already have an active game. Please finish or cash out first.");
        }

        wallet.setBalance(wallet.getBalance().subtract(betAmount));
        walletRepository.save(wallet);

        List<Boolean> grid = generateGrid(minesCount);
        
        MinesSession session = new MinesSession();
        session.setUser(user);
        session.setBetAmount(betAmount);
        session.setMinesCount(minesCount);
        session.setGridState(serializeGrid(grid));
        session.setClickedTiles(new ArrayList<>());
        session.setCurrentMultiplier(BigDecimal.ONE);
        session.setStatus(MinesSession.SessionStatus.ACTIVE);
        
        sessionRepository.save(session);

        BigDecimal nextMultiplier = MinesMathUtil.calculateMultiplier(minesCount, 1);

        MinesResponse response = new MinesResponse();
        response.setSessionId(session.getId());
        response.setMinesCount(minesCount);
        response.setClickedTiles(new ArrayList<>());
        response.setCurrentMultiplier(nextMultiplier);
        response.setNewBalance(wallet.getBalance());
        response.setStatus("ACTIVE");
        return response;
    }

    @Transactional
    public MinesResponse clickTile(Long sessionId, int tileIndex) {
        if (tileIndex < 0 || tileIndex > 24) {
            throw new IllegalArgumentException("Invalid tile index");
        }

        MinesSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() != MinesSession.SessionStatus.ACTIVE) {
            throw new IllegalArgumentException("Game is not active");
        }

        if (session.getClickedTiles().contains(tileIndex)) {
            throw new IllegalArgumentException("Tile already clicked");
        }

        List<Boolean> grid = deserializeGrid(session.getGridState());
        boolean isMine = grid.get(tileIndex);

        if (isMine) {
            session.setStatus(MinesSession.SessionStatus.BUSTED);
            sessionRepository.save(session);

            Wallet wallet = walletRepository.findByUser(session.getUser()).get();

            String gameData = String.format("{\"gameType\":\"MINES\",\"minesCount\":%d,\"gemsRevealed\":%d,\"tileIndex\":%d}", 
                session.getMinesCount(), session.getClickedTiles().size(), tileIndex);
            BetRecord betRecord = new BetRecord(session.getUser(), "MINES", session.getBetAmount(), 
                BigDecimal.ZERO, BigDecimal.ZERO, gameData, "LOSS");
            betRecordRepository.save(betRecord);

            MinesResponse response = new MinesResponse();
            response.setSessionId(session.getId());
            response.setMinesCount(session.getMinesCount());
            response.setClickedTiles(session.getClickedTiles());
            response.setCurrentMultiplier(session.getCurrentMultiplier());
            response.setIsBust(true);
            response.setGridState(grid);
            response.setNewBalance(wallet.getBalance());
            response.setStatus("BUSTED");
            return response;
        }

        session.getClickedTiles().add(tileIndex);
        int gemsRevealed = session.getClickedTiles().size();
        
        // Store CURRENT multiplier in session (for cashout)
        BigDecimal currentMultiplier = MinesMathUtil.calculateMultiplier(session.getMinesCount(), gemsRevealed);
        session.setCurrentMultiplier(currentMultiplier);

        int totalGems = 25 - session.getMinesCount();
        if (gemsRevealed == totalGems) {
            return autoCashOut(session);
        }

        sessionRepository.save(session);

        Wallet wallet = walletRepository.findByUser(session.getUser()).get();

        // Return NEXT multiplier to frontend (for display)
        BigDecimal nextMultiplier = MinesMathUtil.calculateMultiplier(session.getMinesCount(), gemsRevealed + 1);

        MinesResponse response = new MinesResponse();
        response.setSessionId(session.getId());
        response.setMinesCount(session.getMinesCount());
        response.setClickedTiles(session.getClickedTiles());
        response.setCurrentMultiplier(nextMultiplier);
        response.setNewBalance(wallet.getBalance());
        response.setStatus("ACTIVE");
        return response;
    }

    @Transactional
    public MinesResponse cashOut(Long sessionId) {
        MinesSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (session.getStatus() != MinesSession.SessionStatus.ACTIVE) {
            throw new IllegalArgumentException("Game is not active");
        }

        BigDecimal payout = session.getBetAmount()
                .multiply(session.getCurrentMultiplier())
                .setScale(2, RoundingMode.HALF_UP);

        Wallet wallet = walletRepository.findByUser(session.getUser())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(payout));
        walletRepository.save(wallet);

        session.setStatus(MinesSession.SessionStatus.CASHED_OUT);
        sessionRepository.save(session);

        String gameData = String.format("{\"gameType\":\"MINES\",\"minesCount\":%d,\"gemsRevealed\":%d}", 
            session.getMinesCount(), session.getClickedTiles().size());
        BetRecord betRecord = new BetRecord(session.getUser(), "MINES", session.getBetAmount(), 
            session.getCurrentMultiplier(), payout, gameData, "WIN");
        betRecordRepository.save(betRecord);

        List<Boolean> grid = deserializeGrid(session.getGridState());

        MinesResponse response = new MinesResponse();
        response.setSessionId(session.getId());
        response.setMinesCount(session.getMinesCount());
        response.setClickedTiles(session.getClickedTiles());
        response.setCurrentMultiplier(session.getCurrentMultiplier());
        response.setGridState(grid);
        response.setFinalPayout(payout);
        response.setNewBalance(wallet.getBalance());
        response.setStatus("CASHED_OUT");
        return response;
    }

    private MinesResponse autoCashOut(MinesSession session) {
        BigDecimal payout = session.getBetAmount()
                .multiply(session.getCurrentMultiplier())
                .setScale(2, RoundingMode.HALF_UP);

        Wallet wallet = walletRepository.findByUser(session.getUser())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(payout));
        walletRepository.save(wallet);

        session.setStatus(MinesSession.SessionStatus.CASHED_OUT);
        sessionRepository.save(session);

        String gameData = String.format("{\"gameType\":\"MINES\",\"minesCount\":%d,\"gemsRevealed\":%d,\"autoWin\":true}", 
            session.getMinesCount(), session.getClickedTiles().size());
        BetRecord betRecord = new BetRecord(session.getUser(), "MINES", session.getBetAmount(), 
            session.getCurrentMultiplier(), payout, gameData, "WIN");
        betRecordRepository.save(betRecord);

        List<Boolean> grid = deserializeGrid(session.getGridState());

        MinesResponse response = new MinesResponse();
        response.setSessionId(session.getId());
        response.setMinesCount(session.getMinesCount());
        response.setClickedTiles(session.getClickedTiles());
        response.setCurrentMultiplier(session.getCurrentMultiplier());
        response.setIsWin(true);
        response.setGridState(grid);
        response.setFinalPayout(payout);
        response.setNewBalance(wallet.getBalance());
        response.setStatus("CASHED_OUT");
        return response;
    }

    private List<Boolean> generateGrid(int minesCount) {
        List<Boolean> grid = new ArrayList<>(25);
        for (int i = 0; i < 25; i++) {
            grid.add(i < minesCount);
        }
        Collections.shuffle(grid);
        return grid;
    }

    private String serializeGrid(List<Boolean> grid) {
        try {
            return objectMapper.writeValueAsString(grid);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize grid", e);
        }
    }

    private List<Boolean> deserializeGrid(String gridJson) {
        try {
            return objectMapper.readValue(gridJson, new TypeReference<List<Boolean>>() {});
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize grid", e);
        }
    }

    public MinesResponse getActiveSession(String userId) {
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<MinesSession> sessionOpt = sessionRepository.findByUserAndStatus(user, MinesSession.SessionStatus.ACTIVE);
        
        if (sessionOpt.isEmpty()) {
            return null;
        }

        MinesSession session = sessionOpt.get();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found"));

        int gemsRevealed = session.getClickedTiles().size();
        BigDecimal nextMultiplier = MinesMathUtil.calculateMultiplier(session.getMinesCount(), gemsRevealed + 1);

        MinesResponse response = new MinesResponse();
        response.setSessionId(session.getId());
        response.setMinesCount(session.getMinesCount());
        response.setClickedTiles(session.getClickedTiles());
        response.setCurrentMultiplier(nextMultiplier);
        response.setNewBalance(wallet.getBalance());
        response.setStatus("ACTIVE");
        response.setBetAmount(session.getBetAmount());
        return response;
    }
}
