package com.example.backend.controller;

import com.example.backend.dto.ReviewCreateRequest;
import com.example.backend.dto.ReviewResponse;
import com.example.backend.service.ReviewService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /* =========================================================
       GET ALL REVIEWS FOR A HOSTEL
       ========================================================= */

    @GetMapping("/hostel/{hostelId}")
    public ResponseEntity<?> getHostelReviews(
        @PathVariable Long hostelId
    ) {

        try {

            List<ReviewResponse> reviews =
                reviewService.getHostelReviews(
                    hostelId
                );

            return ResponseEntity.ok(reviews);

        } catch (IllegalArgumentException ex) {

            return errorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
            );
        }
    }

    /* =========================================================
       GET CURRENT USER'S REVIEW FOR A HOSTEL
       ========================================================= */

    @GetMapping("/hostel/{hostelId}/mine")
    public ResponseEntity<?> getMyReview(
        @PathVariable Long hostelId,
        Authentication authentication
    ) {

        try {

            ReviewResponse review =
                reviewService.getMyReview(
                    hostelId,
                    authentication
                );

            /*
             * Returning 200 with null is intentional.
             *
             * It tells the frontend:
             * "The user has not submitted a review yet."
             */
            return ResponseEntity.ok(review);

        } catch (SecurityException ex) {

            return errorResponse(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
            );

        } catch (IllegalArgumentException ex) {

            return errorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
            );
        }
    }

    /* =========================================================
       CREATE REVIEW
       ========================================================= */

    @PostMapping
    public ResponseEntity<?> createReview(
        @RequestBody ReviewCreateRequest request,
        Authentication authentication
    ) {

        try {

            ReviewResponse review =
                reviewService.createReview(
                    request,
                    authentication
                );

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(review);

        } catch (SecurityException ex) {

            return errorResponse(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
            );

        } catch (IllegalStateException ex) {

            /*
             * 409 Conflict is important because your
             * ViewDetails.jsx already handles duplicate
             * review submissions using HTTP 409.
             */
            return errorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
            );

        } catch (IllegalArgumentException ex) {

            return errorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
            );
        }
    }

    /* =========================================================
       GET OWNER REVIEWS
       ========================================================= */

    @GetMapping("/owner")
    public ResponseEntity<?> getOwnerReviews(
        Authentication authentication
    ) {

        try {

            List<ReviewResponse> reviews =
                reviewService.getOwnerReviews(
                    authentication
                );

            return ResponseEntity.ok(reviews);

        } catch (SecurityException ex) {

            return errorResponse(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
            );
        }
    }

    /* =========================================================
       OWNER RESPONSE
       ========================================================= */

    @PutMapping("/{reviewId}/response")
    public ResponseEntity<?> updateOwnerResponse(
        @PathVariable Long reviewId,
        @RequestBody OwnerResponseRequest request,
        Authentication authentication
    ) {

        try {

            String response =
                request != null
                    ? request.getResponse()
                    : null;

            ReviewResponse updatedReview =
                reviewService.updateOwnerResponse(
                    reviewId,
                    response,
                    authentication
                );

            return ResponseEntity.ok(
                updatedReview
            );

        } catch (SecurityException ex) {

            return errorResponse(
                HttpStatus.FORBIDDEN,
                ex.getMessage()
            );

        } catch (IllegalArgumentException ex) {

            return errorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
            );
        }
    }

    /* =========================================================
       OWNER RESPONSE REQUEST BODY
       ========================================================= */

    public static class OwnerResponseRequest {

        private String response;

        public String getResponse() {
            return response;
        }

        public void setResponse(
            String response
        ) {
            this.response = response;
        }
    }

    /* =========================================================
       ERROR RESPONSE
       ========================================================= */

    private ResponseEntity<Map<String, String>> errorResponse(
        HttpStatus status,
        String message
    ) {

        Map<String, String> body =
            new HashMap<>();

        body.put(
            "message",
            message != null
                ? message
                : "An error occurred."
        );

        return ResponseEntity
            .status(status)
            .body(body);
    }
}