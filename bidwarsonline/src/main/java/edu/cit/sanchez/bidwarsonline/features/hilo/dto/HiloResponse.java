package edu.cit.sanchez.bidwarsonline.features.hilo.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class HiloResponse {
    private Long sessionId;
    private String currentCardRank;
    private String currentCardSuit;
    private Integer currentCardValue;
    private BigDecimal currentPot;
    private Integer streakCount;
    private Double higherProbability;
    private Double lowerProbability;
    private Boolean isCorrect;
    private Boolean isBust;
    private BigDecimal finalPayout;
    private BigDecimal newBalance;
    private String status;
    private BigDecimal betAmount;

    public HiloResponse() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getCurrentCardRank() { return currentCardRank; }
    public void setCurrentCardRank(String currentCardRank) { this.currentCardRank = currentCardRank; }

    public String getCurrentCardSuit() { return currentCardSuit; }
    public void setCurrentCardSuit(String currentCardSuit) { this.currentCardSuit = currentCardSuit; }

    public Integer getCurrentCardValue() { return currentCardValue; }
    public void setCurrentCardValue(Integer currentCardValue) { this.currentCardValue = currentCardValue; }

    public BigDecimal getCurrentPot() { return currentPot; }
    public void setCurrentPot(BigDecimal currentPot) { this.currentPot = currentPot; }

    public Integer getStreakCount() { return streakCount; }
    public void setStreakCount(Integer streakCount) { this.streakCount = streakCount; }

    public Double getHigherProbability() { return higherProbability; }
    public void setHigherProbability(Double higherProbability) { this.higherProbability = higherProbability; }

    public Double getLowerProbability() { return lowerProbability; }
    public void setLowerProbability(Double lowerProbability) { this.lowerProbability = lowerProbability; }

    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean correct) { isCorrect = correct; }

    public Boolean getIsBust() { return isBust; }
    public void setIsBust(Boolean bust) { isBust = bust; }

    public BigDecimal getFinalPayout() { return finalPayout; }
    public void setFinalPayout(BigDecimal finalPayout) { this.finalPayout = finalPayout; }

    public BigDecimal getNewBalance() { return newBalance; }
    public void setNewBalance(BigDecimal newBalance) { this.newBalance = newBalance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBetAmount() { return betAmount; }
    public void setBetAmount(BigDecimal betAmount) { this.betAmount = betAmount; }
}




