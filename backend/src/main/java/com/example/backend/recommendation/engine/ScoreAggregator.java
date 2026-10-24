package com.example.backend.recommendation.engine;

import com.example.backend.dto.MatchBreakdown;
import org.springframework.stereotype.Component;

@Component
public class ScoreAggregator {

    /*
     * Recommendation weights.
     *
     * Total = 1.00 = 100%
     */
    private static final double LOCATION_WEIGHT = 0.30;

    private static final double BUDGET_WEIGHT = 0.25;

    private static final double ROOM_WEIGHT = 0.20;

    private static final double AMENITY_WEIGHT = 0.15;

    private static final double HOSTEL_TYPE_WEIGHT = 0.10;

    /**
     * Combines all component scores.
     */
    public MatchBreakdown aggregate(
            double budgetScore,
            double locationScore,
            double roomScore,
            double amenityScore,
            double hostelTypeScore
    ) {

        /*
         * Make sure individual scores are valid.
         */
        budgetScore = clamp(budgetScore);

        locationScore = clamp(locationScore);

        roomScore = clamp(roomScore);

        amenityScore = clamp(amenityScore);

        hostelTypeScore = clamp(hostelTypeScore);

        /*
         * Weighted final score.
         */
        double overallScore =
                locationScore * LOCATION_WEIGHT
                        + budgetScore * BUDGET_WEIGHT
                        + roomScore * ROOM_WEIGHT
                        + amenityScore * AMENITY_WEIGHT
                        + hostelTypeScore * HOSTEL_TYPE_WEIGHT;

        overallScore =
                round(overallScore);

        return MatchBreakdown.builder()
                .budgetScore(round(budgetScore))
                .locationScore(round(locationScore))
                .roomScore(round(roomScore))
                .amenityScore(round(amenityScore))
                .hostelTypeScore(round(hostelTypeScore))
                .overallScore(overallScore)
                .summary(
                        generateSummary(
                                overallScore
                        )
                )
                .build();
    }

    private String generateSummary(
            double score
    ) {

        if (score >= 90) {
            return "Excellent match for your preferences.";
        }

        if (score >= 80) {
            return "Very good match for your preferences.";
        }

        if (score >= 70) {
            return "Good match with most of your preferences.";
        }

        if (score >= 50) {
            return "Moderate match. Some preferences differ.";
        }

        if (score >= 30) {
            return "Low match. Several preferences differ.";
        }

        return "Poor match for the selected preferences.";
    }

    private double clamp(double value) {

        if (Double.isNaN(value)
                || Double.isInfinite(value)) {

            return 0.0;
        }

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}