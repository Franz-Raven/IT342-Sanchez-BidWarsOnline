package edu.cit.sanchez.bidwarsonline.features.wallet.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletDto {
    private Long id;
    private Long userId;
    private BigDecimal balance;
    private String currency;
    private LocalDateTime lastUpdated;

    public WalletDto() {}

    public WalletDto(Long id, Long userId, BigDecimal balance, String currency, LocalDateTime lastUpdated) {
        this.id = id;
        this.userId = userId;
        this.balance = balance;
        this.currency = currency;
        this.lastUpdated = lastUpdated;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}





