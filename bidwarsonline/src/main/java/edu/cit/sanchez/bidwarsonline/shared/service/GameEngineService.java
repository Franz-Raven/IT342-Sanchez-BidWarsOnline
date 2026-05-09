package edu.cit.sanchez.bidwarsonline.shared.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class GameEngineService {

    public BigDecimal calculatePayout(BigDecimal betAmount, BigDecimal multiplier) {
        if (multiplier.compareTo(BigDecimal.ONE) < 0) {
            return BigDecimal.ZERO;
        } else {
            return betAmount.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        }
    }

    public String generateGameHash(String gameData, String serverSeed) {
        String combined = gameData + serverSeed;
        return Integer.toHexString(combined.hashCode());
    }
}



