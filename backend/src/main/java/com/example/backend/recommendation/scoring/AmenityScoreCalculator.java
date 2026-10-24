package com.example.backend.recommendation.scoring;

import com.example.backend.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Component
public class AmenityScoreCalculator {

    /**
     * Calculates how many requested amenities
     * are available in the hostel.
     *
     * Score range: 0 - 100.
     */
    public double calculate(
            Collection<String> hostelAmenities,
            RecommendationRequest request
    ) {

        /*
         * User did not specify amenities.
         */
        if (request == null
                || request.getAmenities() == null
                || request.getAmenities().isEmpty()) {

            return 70.0;
        }

        /*
         * Hostel has no amenities.
         */
        if (hostelAmenities == null
                || hostelAmenities.isEmpty()) {

            return 0.0;
        }

        Set<String> requested =
                normalizeSet(
                        request.getAmenities()
                );

        Set<String> available =
                normalizeSet(
                        hostelAmenities
                );

        if (requested.isEmpty()) {
            return 70.0;
        }

        long matched =
                requested.stream()
                        .filter(available::contains)
                        .count();

        double score =
                matched * 100.0
                        / requested.size();

        return clamp(score);
    }

    private Set<String> normalizeSet(
            Collection<String> values
    ) {

        Set<String> result =
                new HashSet<>();

        for (String value : values) {

            if (value == null
                    || value.isBlank()) {

                continue;
            }

            result.add(
                    normalize(value)
            );
        }

        return result;
    }

    private String normalize(String value) {

        return value
                .trim()
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
    }

    private double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }
}