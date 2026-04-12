package edu.cit.sanchez.bidwarsonline.controller;

import edu.cit.sanchez.bidwarsonline.dto.ApiResponse;
import edu.cit.sanchez.bidwarsonline.dto.PlaceBetRequest;
import edu.cit.sanchez.bidwarsonline.dto.PlaceBetResponse;
import edu.cit.sanchez.bidwarsonline.service.PlinkoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/games/plinko")
@CrossOrigin(origins = "*")
public class PlinkoController {

    private final PlinkoService plinkoService;

    public PlinkoController(PlinkoService plinkoService) {
        this.plinkoService = plinkoService;
    }

    @PostMapping("/bet")
    public ResponseEntity<ApiResponse<PlaceBetResponse>> placeBet(@RequestBody PlaceBetRequest request) {
        try {
            Long userId = extractUserIdFromToken();

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

            String risk = "MEDIUM";
            if (request.getConfig() != null && request.getConfig() instanceof java.util.Map) {
                java.util.Map<String, Object> configMap = (java.util.Map<String, Object>) request.getConfig();
                if (configMap.containsKey("risk")) {
                    risk = configMap.get("risk").toString();
                }
            }

            PlaceBetResponse betResponse = plinkoService.placeBet(userId, betAmount, risk);
            return ResponseEntity.ok(new ApiResponse<>(true, betResponse));

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
