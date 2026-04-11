package edu.cit.sanchez.bidwarsonline.controller;

import edu.cit.sanchez.bidwarsonline.dto.ApiResponse;
import edu.cit.sanchez.bidwarsonline.dto.PlaceBetRequest;
import edu.cit.sanchez.bidwarsonline.dto.PlaceBetResponse;
import edu.cit.sanchez.bidwarsonline.dto.PlinkoConfig;
import edu.cit.sanchez.bidwarsonline.service.BettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * GameController handles all game-related API endpoints.
 * 
 * Follows the SDD section 5.2 API specifications exactly.
 * All endpoints return standardized ApiResponse wrapper.
 */
@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "*")
public class GameController {

    private final BettingService bettingService;

    public GameController(BettingService bettingService) {
        this.bettingService = bettingService;
    }

    /**
     * Place a bet on a game and execute the betting round.
     * 
     * API URL: POST /api/games/bet
     * Authentication: Required (Bearer Token / JWT)
     * 
     * Request Payload:
     * {
     *   "gameType": "PLINKO",
     *   "betAmount": 50.00,
     *   "config": {
     *     "risk": "HIGH",
     *     "rows": 16
     *   }
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "transactionId": "TXN-9982",
     *     "resultMultiplier": 2.5,
     *     "payout": 125.00,
     *     "newBalance": 1075.00
     *   },
     *   "timestamp": "2026-02-28T15:00:00Z"
     * }
     * 
     * @param request the betting request with game type, amount, and config
     * @return ApiResponse wrapper with betting result
     */
    @PostMapping("/bet")
    public ResponseEntity<ApiResponse<PlaceBetResponse>> placeBet(@RequestBody PlaceBetRequest request) {
        try {
            // Log the incoming request for debugging
            System.out.println("DEBUG: Received bet request: gameType=" + request.getGameType() + 
                             ", betAmount=" + request.getBetAmount() + 
                             ", config=" + request.getConfig());

            // Extract user ID from JWT token
            Long userId = extractUserIdFromToken();
            System.out.println("DEBUG: Authenticated userId: " + userId);

            // Validate request fields
            if (request.getGameType() == null) {
                System.out.println("DEBUG: gameType is null");
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("VALID-001", "gameType field is missing or null")
                        )
                );
            }

            if (request.getGameType().trim().isEmpty()) {
                System.out.println("DEBUG: gameType is empty");
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("VALID-001", "gameType field is empty")
                        )
                );
            }

            if (request.getBetAmount() == null) {
                System.out.println("DEBUG: betAmount is null");
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("VALID-001", "betAmount field is missing or null")
                        )
                );
            }

            if (request.getBetAmount().trim().isEmpty()) {
                System.out.println("DEBUG: betAmount is empty string");
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("VALID-001", "betAmount field is empty")
                        )
                );
            }

            BigDecimal betAmount;
            try {
                betAmount = new BigDecimal(request.getBetAmount().trim());
                System.out.println("DEBUG: Parsed betAmount: " + betAmount);
                if (betAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    System.out.println("DEBUG: betAmount <= 0: " + betAmount);
                    return ResponseEntity.badRequest().body(
                            new ApiResponse<>(false, null,
                                    new ApiResponse.ErrorDetails("VALID-001", "betAmount must be greater than 0, got: " + betAmount)
                            )
                    );
                }
            } catch (NumberFormatException e) {
                System.out.println("DEBUG: NumberFormatException parsing betAmount: " + request.getBetAmount() + ", error: " + e.getMessage());
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("VALID-001", "betAmount must be a valid number, got: '" + request.getBetAmount() + "'")
                        )
                );
            }

            // Extract game-specific config
            String risk = "MEDIUM";
            Integer rows = 16;

            if (request.getConfig() == null) {
                System.out.println("DEBUG: config is null, using defaults");
            } else if (request.getConfig() instanceof java.util.Map) {
                java.util.Map<String, Object> configMap = (java.util.Map<String, Object>) request.getConfig();
                System.out.println("DEBUG: config is Map with keys: " + configMap.keySet());
                if (configMap.containsKey("risk")) {
                    risk = configMap.get("risk").toString();
                    System.out.println("DEBUG: risk from config: " + risk);
                }
                if (configMap.containsKey("rows")) {
                    try {
                        rows = ((Number) configMap.get("rows")).intValue();
                        System.out.println("DEBUG: rows from config: " + rows);
                    } catch (Exception e) {
                        System.out.println("DEBUG: Error parsing rows: " + e.getMessage());
                        rows = 16; // default
                    }
                }
            } else {
                System.out.println("DEBUG: config is not a Map, type: " + request.getConfig().getClass());
            }

            System.out.println("DEBUG: Calling bettingService.placeBet with: userId=" + userId + 
                             ", gameType=" + request.getGameType() + 
                             ", betAmount=" + betAmount + 
                             ", risk=" + risk + 
                             ", rows=" + rows);

            // Execute betting transaction
            PlaceBetResponse betResponse = bettingService.placeBet(
                    userId,
                    request.getGameType(),
                    betAmount,
                    risk,
                    rows
            );

            System.out.println("DEBUG: Bet successful, response: " + betResponse);
            return ResponseEntity.ok(new ApiResponse<>(true, betResponse));

        } catch (IllegalArgumentException e) {
            System.out.println("DEBUG: IllegalArgumentException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, null,
                            new ApiResponse.ErrorDetails("VALID-001", "Validation error: " + e.getMessage())
                    )
            );
        } catch (RuntimeException e) {
            System.out.println("DEBUG: RuntimeException: " + e.getMessage());
            e.printStackTrace();
            // Check for specific error conditions
            if (e.getMessage().contains("Insufficient balance")) {
                return ResponseEntity.badRequest().body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("WALLET-001", e.getMessage())
                        )
                );
            } else if (e.getMessage().contains("User not found")) {
                return ResponseEntity.status(404).body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("DB-001", "User not found")
                        )
                );
            } else if (e.getMessage().contains("Wallet not found")) {
                return ResponseEntity.status(404).body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("DB-001", "Wallet not found for user")
                        )
                );
            } else {
                return ResponseEntity.status(500).body(
                        new ApiResponse<>(false, null,
                                new ApiResponse.ErrorDetails("SYSTEM-001", "Internal server error: " + e.getMessage())
                        )
                );
            }
        } catch (Exception e) {
            System.out.println("DEBUG: Unexpected Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    new ApiResponse<>(false, null,
                            new ApiResponse.ErrorDetails("SYSTEM-001", "Unexpected error: " + e.getMessage())
                    )
                );
        }
    }

    /**
     * Extract user ID from the JWT token in the Authorization header.
     * 
     * Currently uses Spring Security's SecurityContextHolder.
     * In a real scenario, you'd parse the JWT to extract userId claim.
     * 
     * @return the user ID extracted from the token
     * @throws RuntimeException if token is invalid or missing
     */
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
