package com.example.backend.recommendation.scoring;

import com.example.backend.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class HostelTypeScoreCalculator {

    /**
     * Calculates hostel-type compatibility.
     *
     * Score range: 0 - 100.
     */
    public double calculate(
            String hostelType,
            RecommendationRequest request
    ) {

        if (hostelType == null
                || hostelType.isBlank()) {

            return 0.0;
        }

        /*
         * User didn't specify hostel type.
         */
        if (request == null
                || request.getHostelType() == null
                || request.getHostelType().isBlank()) {

            return 70.0;
        }

        String actual =
                normalize(hostelType);

        String requested =
                normalize(request.getHostelType());

        /*
         * Exact match.
         */
        if (actual.equals(requested)) {
            return 100.0;
        }

        /*
         * Boys aliases.
         */
        if (isBoys(actual)
                && isBoys(requested)) {

            return 100.0;
        }

        /*
         * Girls aliases.
         */
        if (isGirls(actual)
                && isGirls(requested)) {

            return 100.0;
        }

        /*
         * Co-living aliases.
         */
        if (isCoLiving(actual)
                && isCoLiving(requested)) {

            return 100.0;
        }

        /*
         * Different hostel type.
         */
        return 0.0;
    }

    private boolean isBoys(String value) {

        return value.equals("BOYS")
                || value.equals("BOY")
                || value.equals("MALE")
                || value.equals("MEN")
                || value.equals("MENS");
    }

    private boolean isGirls(String value) {

        return value.equals("GIRLS")
                || value.equals("GIRL")
                || value.equals("FEMALE")
                || value.equals("WOMEN")
                || value.equals("WOMENS");
    }

    private boolean isCoLiving(String value) {

        return value.equals("CO_LIVING")
                || value.equals("COLIVING")
                || value.equals("COED")
                || value.equals("UNISEX");
    }

    private String normalize(String value) {

        return value
                .trim()
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
    }
}