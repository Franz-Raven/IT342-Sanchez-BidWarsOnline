package edu.cit.sanchez.bidwarsonline.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class MinesResponse {
    private Long sessionId;
    private Integer minesCount;
    private List<Integer> clickedTiles;
    private BigDecimal currentMultiplier;
    private Boolean isBust;
    private Boolean isWin;
    private List<Boolean> gridState;
    private BigDecimal finalPayout;
    private BigDecimal newBalance;
    private String status;
    private BigDecimal betAmount;

    public MinesResponse() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Integer getMinesCount() { return minesCount; }
    public void setMinesCount(Integer minesCount) { this.minesCount = minesCount; }

    public List<Integer> getClickedTiles() { return clickedTiles; }
    public void setClickedTiles(List<Integer> clickedTiles) { this.clickedTiles = clickedTiles; }

    public BigDecimal getCurrentMultiplier() { return currentMultiplier; }
    public void setCurrentMultiplier(BigDecimal currentMultiplier) { this.currentMultiplier = currentMultiplier; }

    public Boolean getIsBust() { return isBust; }
    public void setIsBust(Boolean bust) { isBust = bust; }

    public Boolean getIsWin() { return isWin; }
    public void setIsWin(Boolean win) { isWin = win; }

    public List<Boolean> getGridState() { return gridState; }
    public void setGridState(List<Boolean> gridState) { this.gridState = gridState; }

    public BigDecimal getFinalPayout() { return finalPayout; }
    public void setFinalPayout(BigDecimal finalPayout) { this.finalPayout = finalPayout; }

    public BigDecimal getNewBalance() { return newBalance; }
    public void setNewBalance(BigDecimal newBalance) { this.newBalance = newBalance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBetAmount() { return betAmount; }
    public void setBetAmount(BigDecimal betAmount) { this.betAmount = betAmount; }
}
