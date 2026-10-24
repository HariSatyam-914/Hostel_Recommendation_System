package com.example.backend.recommendation.scoring;

import com.example.backend.dto.RecommendationRequest;
import org.springframework.stereotype.Component;

@Component
public class RoomScoreCalculator {

    /**
     * Calculates room-type compatibility.
     *
     * Score range: 0 - 100.
     */
    public double calculate(
            String availableRoomType,
            RecommendationRequest request
    ) {

        /*
         * Hostel has no room type.
         */
        if (availableRoomType == null
                || availableRoomType.isBlank()) {

            return 0.0;
        }

        /*
         * User did not specify room type.
         */
        if (request == null
                || request.getRoomType() == null
                || request.getRoomType().isBlank()) {

            return 70.0;
        }

        String actual =
                normalize(availableRoomType);

        String requested =
                normalize(request.getRoomType());

        /*
         * Exact match.
         */
        if (actual.equals(requested)) {
            return 100.0;
        }

        /*
         * Handle common aliases.
         */
        if (isSingle(actual)
                && isSingle(requested)) {

            return 100.0;
        }

        if (isDouble(actual)
                && isDouble(requested)) {

            return 100.0;
        }

        if (isTriple(actual)
                && isTriple(requested)) {

            return 100.0;
        }

        if (isFourSharing(actual)
                && isFourSharing(requested)) {

            return 100.0;
        }

        /*
         * Different room type.
         *
         * We don't completely destroy the hostel's score
         * because other room types may still be useful.
         */
        return 25.0;
    }

    private boolean isSingle(String value) {

        return value.equals("SINGLE")
                || value.equals("1")
                || value.equals("1_SHARING")
                || value.equals("ONE_SHARING");
    }

    private boolean isDouble(String value) {

        return value.equals("DOUBLE")
                || value.equals("2")
                || value.equals("2_SHARING")
                || value.equals("TWO_SHARING");
    }

    private boolean isTriple(String value) {

        return value.equals("TRIPLE")
                || value.equals("3")
                || value.equals("3_SHARING")
                || value.equals("THREE_SHARING");
    }

    private boolean isFourSharing(String value) {

        return value.equals("FOUR")
                || value.equals("4")
                || value.equals("4_SHARING")
                || value.equals("FOUR_SHARING");
    }

    private String normalize(String value) {

        return value
                .trim()
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
    }
}