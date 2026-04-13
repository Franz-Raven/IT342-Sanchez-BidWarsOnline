package edu.cit.sanchez.bidwarsonline.controller;

import edu.cit.sanchez.bidwarsonline.dto.PlaceBetRequest;
import edu.cit.sanchez.bidwarsonline.service.MinesService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/games/mines")
@CrossOrigin(origins = "*")
public class MinesController {

    private final MinesService minesService;

    public MinesController(MinesService minesService) {
        this.minesService = minesService;
    }

    @GetMapping("/active-session")
    public ResponseEntity<?> checkActiveSession() {
        try {
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            var session = minesService.getActiveSession(userId);
            
            if (session == null) {
                return ResponseEntity.ok(Map.of("hasActiveSession", false));
            }
            
            return ResponseEntity.ok(Map.of(
                "hasActiveSession", true,
                "session", session
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bet")
    public ResponseEntity<?> placeBet(@RequestBody PlaceBetRequest request) {
        try {
            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            
            Long sessionId = null;
            Boolean cashOut = false;
            Integer tileIndex = null;
            Integer minesCount = null;

            if (request.getConfig() != null && request.getConfig() instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> config = (Map<String, Object>) request.getConfig();
                
                if (config.get("sessionId") != null) {
                    sessionId = ((Number) config.get("sessionId")).longValue();
                }
                if (config.get("cashOut") != null) {
                    cashOut = Boolean.TRUE.equals(config.get("cashOut"));
                }
                if (config.get("tileIndex") != null) {
                    tileIndex = ((Number) config.get("tileIndex")).intValue();
                }
                if (config.get("minesCount") != null) {
                    minesCount = ((Number) config.get("minesCount")).intValue();
                }
            }

            if (sessionId != null && cashOut) {
                return ResponseEntity.ok(minesService.cashOut(sessionId));
            }

            if (sessionId != null && tileIndex != null) {
                return ResponseEntity.ok(minesService.clickTile(sessionId, tileIndex));
            }

            if (minesCount != null) {
                if (request.getBetAmount() == null || request.getBetAmount().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "betAmount field is required"));
                }

                BigDecimal betAmount;
                try {
                    betAmount = new BigDecimal(request.getBetAmount().trim());
                    if (betAmount.compareTo(BigDecimal.ZERO) <= 0) {
                        return ResponseEntity.badRequest().body(Map.of("error", "betAmount must be greater than 0"));
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("error", "betAmount must be a valid number"));
                }
                
                return ResponseEntity.ok(minesService.startGame(userId, betAmount, minesCount));
            }

            throw new IllegalArgumentException("Invalid request configuration");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
