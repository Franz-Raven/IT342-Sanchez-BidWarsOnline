package edu.cit.sanchez.bidwarsonline.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlaceBetRequest {
    @JsonProperty("gameType")
    private String gameType;
    @JsonProperty("betAmount")
    private String betAmount;
    @JsonProperty("config")
    private Object config;

    public PlaceBetRequest() {
    }

    public PlaceBetRequest(String gameType, String betAmount, Object config) {
        this.gameType = gameType;
        this.betAmount = betAmount;
        this.config = config;
    }

    public String getGameType() {
        return gameType;
    }

    public void setGameType(String gameType) {
        this.gameType = gameType;
    }

    public String getBetAmount() {
        return betAmount;
    }

    public void setBetAmount(String betAmount) {
        this.betAmount = betAmount;
    }

    public Object getConfig() {
        return config;
    }

    public void setConfig(Object config) {
        this.config = config;
    }
}



