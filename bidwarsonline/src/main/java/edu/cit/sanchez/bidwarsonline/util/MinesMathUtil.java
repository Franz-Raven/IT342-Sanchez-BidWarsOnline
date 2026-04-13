package edu.cit.sanchez.bidwarsonline.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class MinesMathUtil {
    
    private static final BigDecimal HOUSE_EDGE = new BigDecimal("0.97");
    private static final int TOTAL_TILES = 25;

    public static BigDecimal calculateMultiplier(int minesCount, int gemsRevealed) {
        if (gemsRevealed == 0) {
            return BigDecimal.ONE;
        }

        int safeTiles = TOTAL_TILES - minesCount;
        
        if (gemsRevealed > safeTiles) {
            return BigDecimal.ONE;
        }

        BigDecimal probability = BigDecimal.ONE;
        
        for (int i = 0; i < gemsRevealed; i++) {
            int currentSafeTiles = safeTiles - i;
            int currentTotalTiles = TOTAL_TILES - i;
            
            if (currentTotalTiles == 0) {
                return BigDecimal.ONE;
            }
            
            BigDecimal stepProbability = new BigDecimal(currentSafeTiles)
                .divide(new BigDecimal(currentTotalTiles), 10, RoundingMode.HALF_UP);
            probability = probability.multiply(stepProbability);
        }

        if (probability.compareTo(BigDecimal.ZERO) == 0) {
            return new BigDecimal("999999.99");
        }

        BigDecimal baseMultiplier = BigDecimal.ONE.divide(probability, 10, RoundingMode.HALF_UP);
        BigDecimal finalMultiplier = baseMultiplier.multiply(HOUSE_EDGE);

        return finalMultiplier.setScale(2, RoundingMode.HALF_UP);
    }
}
