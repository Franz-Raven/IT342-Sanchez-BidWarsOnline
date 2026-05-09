package edu.cit.sanchez.bidwarsonline.features.hilo.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class HiLoMathUtil {
    
    private static final double HOUSE_EDGE = 0.97;
    private static final double STREAK_BONUS_PER_WIN = 0.10;
    
    public static double calculateProbability(int currentCard, String guess) {
        if ("HIGHER".equalsIgnoreCase(guess)) {
            return (14.0 - currentCard) / 13.0;
        } else if ("LOWER".equalsIgnoreCase(guess)) {
            return (currentCard - 2.0) / 13.0;
        }
        throw new IllegalArgumentException("Invalid guess: " + guess);
    }
    
    public static BigDecimal calculateMultiplier(double probability, int streakCount) {
        if (probability <= 0) {
            throw new IllegalArgumentException("Probability must be greater than 0");
        }
        
        double baseMultiplier = (1.0 / probability) * HOUSE_EDGE;
        double streakBonus = 1.0 + (streakCount * STREAK_BONUS_PER_WIN);
        double finalMultiplier = baseMultiplier * streakBonus;
        
        return BigDecimal.valueOf(finalMultiplier).setScale(4, RoundingMode.HALF_UP);
    }
    
    public static String rankToString(int rank) {
        switch (rank) {
            case 11: return "J";
            case 12: return "Q";
            case 13: return "K";
            case 14: return "A";
            default: return String.valueOf(rank);
        }
    }
}




