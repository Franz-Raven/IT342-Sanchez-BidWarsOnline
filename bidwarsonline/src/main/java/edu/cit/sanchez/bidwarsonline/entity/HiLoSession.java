package edu.cit.sanchez.bidwarsonline.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hilo_sessions")
public class HiLoSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private BigDecimal initialBetAmount;
    
    @Column(nullable = false)
    private BigDecimal currentPot;
    
    @Column(nullable = false)
    private Integer currentCardRank;
    
    @Column(nullable = false)
    private Integer streakCount = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum SessionStatus {
        ACTIVE, BUSTED, CASHED_OUT
    }
    
    public HiLoSession() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public HiLoSession(User user, BigDecimal initialBetAmount, BigDecimal currentPot, Integer currentCardRank) {
        this.user = user;
        this.initialBetAmount = initialBetAmount;
        this.currentPot = currentPot;
        this.currentCardRank = currentCardRank;
        this.streakCount = 0;
        this.status = SessionStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public BigDecimal getInitialBetAmount() { return initialBetAmount; }
    public void setInitialBetAmount(BigDecimal initialBetAmount) { this.initialBetAmount = initialBetAmount; }
    
    public BigDecimal getCurrentPot() { return currentPot; }
    public void setCurrentPot(BigDecimal currentPot) { this.currentPot = currentPot; }
    
    public Integer getCurrentCardRank() { return currentCardRank; }
    public void setCurrentCardRank(Integer currentCardRank) { this.currentCardRank = currentCardRank; }
    
    public Integer getStreakCount() { return streakCount; }
    public void setStreakCount(Integer streakCount) { this.streakCount = streakCount; }
    
    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
