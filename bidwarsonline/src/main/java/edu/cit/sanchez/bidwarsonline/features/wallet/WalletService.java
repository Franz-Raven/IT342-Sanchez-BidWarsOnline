package edu.cit.sanchez.bidwarsonline.features.wallet;

import edu.cit.sanchez.bidwarsonline.features.wallet.dto.WalletDto;
import edu.cit.sanchez.bidwarsonline.features.wallet.Wallet;
import edu.cit.sanchez.bidwarsonline.features.wallet.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {
    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @Transactional(readOnly = true)
    public WalletDto getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + userId));
        return toDto(wallet);
    }

    public static WalletDto toDto(Wallet wallet) {
        return new WalletDto(
                wallet.getId(),
                wallet.getUser().getId(),
                wallet.getBalance(),
                wallet.getCurrency(),
                wallet.getLastUpdated()
        );
    }
}





