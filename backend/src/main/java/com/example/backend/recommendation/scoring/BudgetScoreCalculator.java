package com.example.backend.recommendation.scoring;

import com.example.backend.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BudgetScoreCalculator {

    /**
     * Calculates how well the hostel rent matches
     * the user's budget.
     *
     * Score range: 0 - 100
     */
    public double calculate(
            BigDecimal rent,
            RecommendationRequest request
    ) {

        if (rent == null || rent.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }

        if (request == null) {
            return 0.0;
        }

        BigDecimal maxBudget = request.getMaxBudget();
        BigDecimal minBudget = request.getMinBudget();

        /*
         * User did not specify any budget.
         */
        if (maxBudget == null && minBudget == null) {
            return 70.0;
        }

        /*
         * Invalid maximum budget.
         */
        if (maxBudget != null
                && maxBudget.compareTo(BigDecimal.ZERO) <= 0) {
            maxBudget = null;
        }

        /*
         * Invalid minimum budget.
         */
        if (minBudget != null
                && minBudget.compareTo(BigDecimal.ZERO) < 0) {
            minBudget = null;
        }

        /*
         * No valid budget after validation.
         */
        if (maxBudget == null && minBudget == null) {
            return 70.0;
        }

        /*
         * ============================================================
         * CASE 1: Maximum budget exists
         * ============================================================
         */
        if (maxBudget != null) {

            double budget = maxBudget.doubleValue();
            double hostelRent = rent.doubleValue();

            /*
             * Hostel is comfortably below budget.
             *
             * Example:
             *
             * Budget = 10,000
             * Rent   = 6,000
             *
             * Very good match.
             */
            if (hostelRent <= budget) {

                double utilization =
                        hostelRent / budget;

                /*
                 * Around 60% of budget -> excellent.
                 * Around 100% -> still good.
                 */
                double score =
                        100.0 - (utilization * 25.0);

                return clamp(score);
            }

            /*
             * Hostel is above budget.
             *
             * We don't immediately return zero.
             *
             * Example:
             *
             * User budget = 8,000
             * Hostel      = 8,300
             *
             * This could still be useful.
             */
            double excess =
                    (hostelRent - budget) / budget;

            /*
             * Small excess -> moderate penalty.
             * Large excess -> severe penalty.
             */
            double score =
                    100.0 - (excess * 200.0);

            return clamp(score);
        }

        /*
         * ============================================================
         * CASE 2: Only minimum budget exists
         * ============================================================
         */

        if (minBudget != null) {

            if (rent.compareTo(minBudget) >= 0) {
                return 90.0;
            }

            /*
             * Cheaper than the user's minimum is generally
             * not a serious problem.
             */
            return 80.0;
        }

        return 50.0;
    }

    private double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }
}