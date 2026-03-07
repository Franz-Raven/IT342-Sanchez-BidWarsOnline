package edu.cit.sanchez.bidwarsonline.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bet_records")
public class BetRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "game_type", nullable = false)
    private String gameType;

    @Column(name = "bet_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal betAmount;

    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal multiplier;

    @Column(name = "payout_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal payoutAmount;

    @Column(name = "game_data", columnDefinition = "TEXT")
    private String gameData;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public BetRecord() {
    }

    public BetRecord(User user, String gameType, BigDecimal betAmount, BigDecimal multiplier, BigDecimal payoutAmount, String gameData, String status) {
        this.user = user;
        this.gameType = gameType;
        this.betAmount = betAmount;
        this.multiplier = multiplier;
        this.payoutAmount = payoutAmount;
        this.gameData = gameData;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public BigDecimal getBetAmount() {
        return betAmount;
    }

    public void setBetAmount(BigDecimal betAmount) {
        this.betAmount = betAmount;
    }

    public BigDecimal getMultiplier() {
        return multiplier;
    }

    public void setMultiplier(BigDecimal multiplier) {
        this.multiplier = multiplier;
    }

    public BigDecimal getPayoutAmount() {
        return payoutAmount;
    }

    public void setPayoutAmount(BigDecimal payoutAmount) {
        this.payoutAmount = payoutAmount;
    }

    public String getGameData() {
        return gameData;
    }

    public void setGameData(String gameData) {
        this.gameData = gameData;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}