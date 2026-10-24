package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchBreakdown {

    /**
     * Individual component scores.
     * Each score is normalized between 0 and 100.
     */
    private Double budgetScore;

    private Double locationScore;

    private Double roomScore;

    private Double amenityScore;

    private Double hostelTypeScore;

    /**
     * Final weighted score.
     */
    private Double overallScore;

    /**
     * Human-readable explanation.
     */
    private String summary;
}