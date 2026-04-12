package edu.cit.sanchez.bidwarsonline.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mines_sessions")
public class MinesSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal betAmount;

    @Column(nullable = false)
    private Integer minesCount;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String gridState;

    @ElementCollection
    @CollectionTable(name = "mines_clicked_tiles", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "tile_index")
    private List<Integer> clickedTiles = new ArrayList<>();

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal currentMultiplier = BigDecimal.ONE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public enum SessionStatus {
        ACTIVE, BUSTED, CASHED_OUT
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public MinesSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public BigDecimal getBetAmount() { return betAmount; }
    public void setBetAmount(BigDecimal betAmount) { this.betAmount = betAmount; }

    public Integer getMinesCount() { return minesCount; }
    public void setMinesCount(Integer minesCount) { this.minesCount = minesCount; }

    public String getGridState() { return gridState; }
    public void setGridState(String gridState) { this.gridState = gridState; }

    public List<Integer> getClickedTiles() { return clickedTiles; }
    public void setClickedTiles(List<Integer> clickedTiles) { this.clickedTiles = clickedTiles; }

    public BigDecimal getCurrentMultiplier() { return currentMultiplier; }
    public void setCurrentMultiplier(BigDecimal currentMultiplier) { this.currentMultiplier = currentMultiplier; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
