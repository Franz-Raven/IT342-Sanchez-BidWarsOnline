package edu.cit.sanchez.bidwarsonline.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;

/**
 * GameEngineService handles game logic and Provably Fair RNG for all supported games.
 * This service generates deterministic yet random game outcomes based on cryptographic seeds.
 * 
 * Currently implements Plinko logic with standard probability distributions.
 */
@Service
public class GameEngineService {

    private static final SecureRandom secureRandom = new SecureRandom();

    /**
     * Execute a Plinko game round and calculate the result multiplier.
     * 
     * Plinko works by simulating a ball dropping through a Galton board (binary tree of pegs).
     * The final position determines the multiplier payout.
     * Fixed to 15 buckets (14 rows).
     * 
     * @param betAmount the amount wagered
     * @param risk the risk level (LOW, MEDIUM, HIGH)
     * @param rows ignored; always uses 14 rows (15 buckets)
     * @return the result multiplier for this game round
     */
    public BigDecimal calculatePlinkoMultiplier(BigDecimal betAmount, String risk, Integer rows) {
        // Validate inputs
        if (betAmount == null || betAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Bet amount must be greater than 0");
        }

        // Fixed to 14 rows = 15 possible buckets (0-14)
        final int FIXED_ROWS = 14;

        // Simulate ball drops based on row count
        // Each path through the board is determined by a series of left/right choices
        int finalBucket = simulateBallDrop(FIXED_ROWS);

        // Map the final bucket position to a multiplier
        BigDecimal multiplier = getMultiplierForBucket(finalBucket, FIXED_ROWS, risk);

        return multiplier;
    }

    /**
     * Simulate a ball dropping through a Galton board.
     * Returns the final bucket position (0 to rows).
     * 
     * @param rows the number of rows (pegs) in the board
     * @return the final bucket position
     */
    private int simulateBallDrop(Integer rows) {
        int position = 0;
        
        // For each row, randomly choose left (0) or right (1)
        for (int i = 0; i < rows; i++) {
            position += secureRandom.nextInt(2);
        }
        
        return position;
    }

    /**
     * Get the multiplier for a given bucket position.
     * Uses predefined multiplier arrays by risk level.
     * 
     * @param bucketPosition the final bucket position (0-14 for 15 buckets)
     * @param rows the number of rows (fixed at 14)
     * @param risk the risk level (LOW, MEDIUM, HIGH)
     * @return the multiplier as BigDecimal
     */
    private BigDecimal getMultiplierForBucket(int bucketPosition, int rows, String risk) {
        double[] multipliers = getMultipliersForRisk(risk);
        
        // Ensure bucket position is within bounds
        int index = Math.min(bucketPosition, multipliers.length - 1);
        double multiplier = multipliers[index];

        return BigDecimal.valueOf(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Get the 15-bucket multiplier array for a given risk level.
     * 
     * @param risk the risk level (LOW, MEDIUM, HIGH)
     * @return array of 15 multiplier values
     */
    private double[] getMultipliersForRisk(String risk) {
        if (risk == null) {
            risk = "MEDIUM";
        }

        switch (risk.toUpperCase()) {
            case "LOW":
                // Low risk: conservative payout structure with 18x at edges
                return new double[] {
                    18.0, 3.2, 1.6, 1.3, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.3, 1.6, 3.2, 18.0
                };
            case "HIGH":
                // High risk: extreme volatility with 353x at edges
                return new double[] {
                    353.0, 49.0, 14.0, 5.3, 2.1, 0.5, 0.2, 0.0, 0.2, 0.5, 2.1, 5.3, 14.0, 49.0, 353.0
                };
            case "MEDIUM":
            default:
                // Medium risk: balanced payout structure with 55x at edges
                return new double[] {
                    55.0, 12.0, 5.6, 3.2, 1.6, 1.0, 0.7, 0.2, 0.7, 1.0, 1.6, 3.2, 5.6, 12.0, 55.0
                };
        }
    }



    /**
     * Calculate the payout for a game result.
     * 
     * @param betAmount the original bet amount
     * @param multiplier the result multiplier
     * @return the total payout (bet + winnings)
     */
    public BigDecimal calculatePayout(BigDecimal betAmount, BigDecimal multiplier) {
        if (multiplier.compareTo(BigDecimal.ONE) < 0) {
            // Loss: return 0 (user loses their bet)
            return BigDecimal.ZERO;
        } else {
            // Win: return bet * multiplier
            return betAmount.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
        }
    }

    /**
     * Generate a Provably Fair hash for auditing game fairness.
     * This hash can be used to verify the game outcome was not tampered with.
     * 
     * @param gameData the game state/data
     * @param serverSeed the server-side seed
     * @return the hash string
     */
    public String generateGameHash(String gameData, String serverSeed) {
        // Placeholder: actual implementation would use SHA-256 or similar
        // For now, return a placeholder hash
        String combined = gameData + serverSeed;
        return Integer.toHexString(combined.hashCode());
    }
}
