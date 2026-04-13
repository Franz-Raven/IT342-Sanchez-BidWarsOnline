package edu.cit.sanchez.bidwarsonline.service;

import edu.cit.sanchez.bidwarsonline.dto.WalletDto;
import edu.cit.sanchez.bidwarsonline.entity.Wallet;
import edu.cit.sanchez.bidwarsonline.repository.WalletRepository;
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
