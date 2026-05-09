package edu.cit.sanchez.bidwarsonline.features.wallet;

import edu.cit.sanchez.bidwarsonline.shared.dto.ApiResponse;
import edu.cit.sanchez.bidwarsonline.features.wallet.dto.WalletDto;
import edu.cit.sanchez.bidwarsonline.features.wallet.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<WalletDto>> getMyWallet() {
        try {
            Long userId = extractUserIdFromToken();
            WalletDto wallet = walletService.getWalletByUserId(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, wallet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, null, new ApiResponse.ErrorDetails("WALLET_ERROR", e.getMessage())));
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





