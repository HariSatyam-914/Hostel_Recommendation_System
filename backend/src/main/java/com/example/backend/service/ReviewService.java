package com.example.backend.service;

import com.example.backend.dto.ReviewCreateRequest;
import com.example.backend.dto.ReviewResponse;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface ReviewService {

    /*
     * Create a new review for a hostel.
     */
    ReviewResponse createReview(
        ReviewCreateRequest request,
        Authentication authentication
    );

    /*
     * Get all reviews for a hostel.
     */
    List<ReviewResponse> getHostelReviews(
        Long hostelId
    );

    /*
     * Get the currently authenticated user's
     * review for a hostel.
     */
    ReviewResponse getMyReview(
        Long hostelId,
        Authentication authentication
    );

    /*
     * Get all reviews for hostels owned by
     * the currently authenticated owner.
     */
    List<ReviewResponse> getOwnerReviews(
        Authentication authentication
    );

    /*
     * Add or update the owner's response
     * to a review.
     */
    ReviewResponse updateOwnerResponse(
        Long reviewId,
        String response,
        Authentication authentication
    );
}