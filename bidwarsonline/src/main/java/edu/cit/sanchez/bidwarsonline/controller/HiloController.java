package edu.cit.sanchez.bidwarsonline.controller;

import edu.cit.sanchez.bidwarsonline.dto.ApiResponse;
import edu.cit.sanchez.bidwarsonline.dto.PlaceBetRequest;
import edu.cit.sanchez.bidwarsonline.dto.HiloResponse;
import edu.cit.sanchez.bidwarsonline.service.HiloService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/games/hilo")
@CrossOrigin(origins = "*")
public class HiloController {

    private final HiloService hiloService;

    public HiloController(HiloService hiloService) {
        this.hiloService = hiloService;
    }

    @PostMapping("/bet")
    public ResponseEntity<ApiResponse<HiloResponse>> placeBet(@RequestBody PlaceBetRequest request) {
        try {
            Long userId = extractUserIdFromToken();

            String prediction = null;
            Long sessionId = null;
            Boolean cashOut = false;

            if (request.getConfig() != null && request.getConfig() instanceof java.util.Map) {
                java.util.Map<String, Object> configMap = (java.util.Map<String, Object>) request.getConfig();
                if (configMap.containsKey("prediction")) {
                    prediction = configMap.get("prediction").toString();
                }
                if (configMap.containsKey("sessionId")) {
                    sessionId = ((Number) configMap.get("sessionId")).longValue();
                }
                if (configMap.containsKey("cashOut")) {
                    cashOut = Boolean.TRUE.equals(configMap.get("cashOut"));
                }
            }

            HiloResponse response;
            if (cashOut && sessionId != null) {
                response = hiloService.cashOut(sessionId);
            } else if (prediction != null && sessionId != null) {
                response = hiloService.makeGuess(sessionId, prediction);
            } else {
                if (request.getBetAmount() == null || request.getBetAmount().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(
                            new ApiResponse<>(false, null,
                                    new ApiResponse.ErrorDetails("VALID-001", "betAmount field is required"))
                    );
                }

                BigDecimal betAmount;
                try {
                    betAmount = new BigDecimal(request.getBetAmount().trim());
                    if (betAmount.compareTo(BigDecimal.ZERO) <= 0) {
                        return ResponseEntity.badRequest().body(
                                new ApiResponse<>(false, null,
                                        new ApiResponse.ErrorDetails("VALID-001", "betAmount must be greater than 0"))
                        );
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(
                            new ApiResponse<>(false, null,
                                    new ApiResponse.ErrorDetails("VALID-001", "betAmount must be a valid number"))
                    );
                }
                response = hiloService.startGame(userId, betAmount);
            }

            return ResponseEntity.ok(new ApiResponse<>(true, response));

        } catch (RuntimeException e) {
            if (e.getMessage().contains("Insufficient balance")) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("WALLET-001", e.getMessage()))
                );
            } else if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404).body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("DB-001", e.getMessage()))
                );
            } else if (e.getMessage().contains("already have an active game")) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("GAME-001", e.getMessage()))
                );
            } else {
                return ResponseEntity.status(500).body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("SYSTEM-001", e.getMessage()))
                );
            }
        }
    }

    private Long extractUserIdFromToken() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized: missing or invalid JWT token");
        }
        try {
            return Long.parseLong(authentication.getPrincipal().toString());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user identifier in token");
        }
    }
}
