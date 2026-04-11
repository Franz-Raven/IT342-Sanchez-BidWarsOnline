package edu.cit.sanchez.bidwarsonline.dto;

import java.math.BigDecimal;

public class PlaceBetResponse {
    private String transactionId;
    private BigDecimal resultMultiplier;
    private BigDecimal payout;
    private BigDecimal newBalance;

    public PlaceBetResponse() {
    }

    public PlaceBetResponse(String transactionId, BigDecimal resultMultiplier, BigDecimal payout, BigDecimal newBalance) {
        this.transactionId = transactionId;
        this.resultMultiplier = resultMultiplier;
        this.payout = payout;
        this.newBalance = newBalance;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public BigDecimal getResultMultiplier() {
        return resultMultiplier;
    }

    public void setResultMultiplier(BigDecimal resultMultiplier) {
        this.resultMultiplier = resultMultiplier;
    }

    public BigDecimal getPayout() {
        return payout;
    }

    public void setPayout(BigDecimal payout) {
        this.payout = payout;
    }

    public BigDecimal getNewBalance() {
        return newBalance;
    }

    public void setNewBalance(BigDecimal newBalance) {
        this.newBalance = newBalance;
    }
}
