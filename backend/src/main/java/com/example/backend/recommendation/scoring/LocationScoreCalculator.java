package com.example.backend.recommendation.scoring;

import com.example.backend.dto.RecommendationRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Component
public class LocationScoreCalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates location score.
     *
     * Score range: 0 - 100.
     */
    public LocationResult calculate(
            Double hostelLatitude,
            Double hostelLongitude,
            RecommendationRequest request
    ) {

        if (request == null) {
            return LocationResult.builder()
                    .score(0.0)
                    .distanceKm(null)
                    .build();
        }

        /*
         * We can calculate an actual distance only when
         * both user and hostel coordinates are available.
         */
        if (request.getLatitude() != null
                && request.getLongitude() != null
                && hostelLatitude != null
                && hostelLongitude != null) {

            double distanceKm =
                    calculateDistance(
                            request.getLatitude(),
                            request.getLongitude(),
                            hostelLatitude,
                            hostelLongitude
                    );

            double score =
                    calculateScore(
                            distanceKm,
                            request.getMaxDistanceKm()
                    );

            return LocationResult.builder()
                    .score(score)
                    .distanceKm(
                            round(distanceKm)
                    )
                    .build();
        }

        /*
         * We cannot honestly calculate distance
         * from a location string alone.
         *
         * Example:
         * "HITEC City"
         *
         * needs geocoding before exact distance can be known.
         */
        if (request.getOfficeLocation() != null
                && !request.getOfficeLocation().isBlank()) {

            return LocationResult.builder()
                    .score(50.0)
                    .distanceKm(null)
                    .build();
        }

        /*
         * No location preference.
         */
        return LocationResult.builder()
                .score(50.0)
                .distanceKm(null)
                .build();
    }

    /**
     * Haversine distance calculation.
     */
    private double calculateDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2
    ) {

        double latitudeDistance =
                Math.toRadians(
                        latitude2 - latitude1
                );

        double longitudeDistance =
                Math.toRadians(
                        longitude2 - longitude1
                );

        double a =
                Math.sin(latitudeDistance / 2)
                        * Math.sin(latitudeDistance / 2)
                        + Math.cos(
                                Math.toRadians(latitude1)
                        )
                        * Math.cos(
                                Math.toRadians(latitude2)
                        )
                        * Math.sin(longitudeDistance / 2)
                        * Math.sin(longitudeDistance / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS_KM * c;
    }

    private double calculateScore(
            double distanceKm,
            Double maxDistanceKm
    ) {

        /*
         * Default maximum useful distance.
         */
        double maximumDistance =
                maxDistanceKm != null
                        && maxDistanceKm > 0
                        ? maxDistanceKm
                        : 10.0;

        /*
         * Extremely close.
         */
        if (distanceKm <= 1.0) {
            return 100.0;
        }

        /*
         * Beyond preferred radius.
         */
        if (distanceKm >= maximumDistance) {
            return 0.0;
        }

        /*
         * Linear falloff.
         */
        double score =
                100.0
                        * (maximumDistance - distanceKm)
                        / (maximumDistance - 1.0);

        return clamp(score);
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }

    private double clamp(double value) {

        return Math.max(
                0.0,
                Math.min(100.0, value)
        );
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationResult {

        private Double score;

        private Double distanceKm;
    }
}