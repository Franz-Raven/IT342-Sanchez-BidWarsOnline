package edu.cit.sanchez.bidwarsonline.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class MinesMathUtil {
    
    private static final BigDecimal HOUSE_EDGE = new BigDecimal("0.97");

    public static long calculateCombination(int n, int r) {
        if (r > n) return 0;
        if (r == 0 || r == n) return 1;
        
        r = Math.min(r, n - r);
        
        long result = 1;
        for (int i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return result;
    }

    public static BigDecimal calculateMultiplier(int minesCount, int gemsRevealed) {
        if (gemsRevealed == 0) {
            return BigDecimal.ONE;
        }

        int totalTiles = 25;
        int gemsTotal = totalTiles - minesCount;

        long favorableOutcomes = calculateCombination(gemsTotal, gemsRevealed);
        long totalOutcomes = calculateCombination(totalTiles, gemsRevealed);

        if (totalOutcomes == 0) {
            return BigDecimal.ONE;
        }

        double probability = (double) favorableOutcomes / totalOutcomes;
        double baseMultiplier = 1.0 / probability;
        double finalMultiplier = baseMultiplier * HOUSE_EDGE.doubleValue();

        return BigDecimal.valueOf(finalMultiplier).setScale(4, RoundingMode.HALF_UP);
    }
}
