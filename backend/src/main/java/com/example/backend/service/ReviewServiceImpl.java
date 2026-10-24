package com.example.backend.service;

import com.example.backend.dto.ReviewCreateRequest;
import com.example.backend.dto.ReviewResponse;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.HostelRepository;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    private final UserRepository userRepository;

    private final HostelRepository hostelRepository;

    /* =========================================================
       CREATE REVIEW
       ========================================================= */

    @Override
    public ReviewResponse createReview(
        ReviewCreateRequest request,
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        if (request == null) {
            throw new IllegalArgumentException(
                "Review request cannot be empty."
            );
        }

        if (request.getHostelId() == null) {
            throw new IllegalArgumentException(
                "Hostel ID is required."
            );
        }

        if (request.getRating() == null) {
            throw new IllegalArgumentException(
                "Rating is required."
            );
        }

        if (
            request.getRating() < 1 ||
            request.getRating() > 5
        ) {
            throw new IllegalArgumentException(
                "Rating must be between 1 and 5."
            );
        }

        String comment =
            request.getComment() == null
                ? ""
                : request.getComment().trim();

        if (comment.length() < 10) {
            throw new IllegalArgumentException(
                "Review must contain at least 10 characters."
            );
        }

        if (comment.length() > 2000) {
            throw new IllegalArgumentException(
                "Review cannot exceed 2000 characters."
            );
        }

        HostelBasicInfo hostel =
            hostelRepository.findById(
                request.getHostelId()
            ).orElseThrow(
                () -> new IllegalArgumentException(
                    "Hostel not found."
                )
            );

        /*
         * Application-level duplicate check.
         */
        boolean alreadyReviewed =
            reviewRepository.existsByHostelHostelIdAndUserId(
                hostel.getHostelId(),
                user.getId()
            );

        if (alreadyReviewed) {
            throw new IllegalStateException(
                "You have already reviewed this hostel."
            );
        }

        Review review = Review.builder()
            .user(user)
            .hostel(hostel)
            .rating(request.getRating())
            .comment(comment)
            .ownerResponse(null)
            .build();

        try {

            Review savedReview =
                reviewRepository.save(review);

            return mapToResponse(savedReview);

        } catch (DataIntegrityViolationException ex) {

            /*
             * The database unique constraint is the final
             * protection against duplicate reviews when two
             * requests arrive at nearly the same time.
             */
            throw new IllegalStateException(
                "You have already reviewed this hostel."
            );
        }
    }

    /* =========================================================
       GET HOSTEL REVIEWS
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getHostelReviews(
        Long hostelId
    ) {

        if (hostelId == null) {
            throw new IllegalArgumentException(
                "Hostel ID is required."
            );
        }

        /*
         * Make sure the hostel exists.
         */
        if (!hostelRepository.existsById(hostelId)) {
            throw new IllegalArgumentException(
                "Hostel not found."
            );
        }

        return reviewRepository
            .findByHostelHostelIdOrderByCreatedAtDesc(
                hostelId
            )
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    /* =========================================================
       GET CURRENT USER REVIEW
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getMyReview(
        Long hostelId,
        Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        if (hostelId == null) {
            throw new IllegalArgumentException(
                "Hostel ID is required."
            );
        }

        /*
         * If the user has not reviewed this hostel,
         * return null.
         *
         * The frontend can then keep the review form open.
         */
        return reviewRepository
            .findByHostelHostelIdAndUserId(
                hostelId,
                user.getId()
            )
            .map(this::mapToResponse)
            .orElse(null);
    }

    /* =========================================================
       GET OWNER REVIEWS
       ========================================================= */

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getOwnerReviews(
        Authentication authentication
    ) {

        User owner =
            getAuthenticatedUser(authentication);

        return reviewRepository
            .findByHostelOwnerIdOrderByCreatedAtDesc(
                owner.getId()
            )
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    /* =========================================================
       UPDATE OWNER RESPONSE
       ========================================================= */

    @Override
    public ReviewResponse updateOwnerResponse(
        Long reviewId,
        String response,
        Authentication authentication
    ) {

        User owner =
            getAuthenticatedUser(authentication);

        if (reviewId == null) {
            throw new IllegalArgumentException(
                "Review ID is required."
            );
        }

        String cleanedResponse =
            response == null
                ? ""
                : response.trim();

        if (cleanedResponse.isEmpty()) {
            throw new IllegalArgumentException(
                "Response cannot be empty."
            );
        }

        if (cleanedResponse.length() > 500) {
            throw new IllegalArgumentException(
                "Response cannot exceed 500 characters."
            );
        }

        Review review =
            reviewRepository.findById(reviewId)
                .orElseThrow(
                    () -> new IllegalArgumentException(
                        "Review not found."
                    )
                );

        /*
         * Security check:
         *
         * The owner can respond only to reviews belonging
         * to their own hostel.
         */
        HostelBasicInfo hostel =
            review.getHostel();

        if (
            hostel == null ||
            hostel.getOwner() == null ||
            !hostel.getOwner()
                .getId()
                .equals(owner.getId())
        ) {
            throw new SecurityException(
                "You are not authorized to respond to this review."
            );
        }

        review.setOwnerResponse(
            cleanedResponse
        );

        Review updatedReview =
            reviewRepository.save(review);

        return mapToResponse(updatedReview);
    }

    /* =========================================================
       GET AUTHENTICATED USER
       ========================================================= */

    private User getAuthenticatedUser(
        Authentication authentication
    ) {

        if (
            authentication == null ||
            !authentication.isAuthenticated()
        ) {
            throw new SecurityException(
                "Authentication is required."
            );
        }

        String email =
            authentication.getName();

        if (
            email == null ||
            email.trim().isEmpty()
        ) {
            throw new SecurityException(
                "Authenticated user email is missing."
            );
        }

        return userRepository
            .findByEmail(email)
            .orElseThrow(
                () -> new SecurityException(
                    "Authenticated user not found."
                )
            );
    }

    /* =========================================================
       MAP ENTITY → RESPONSE DTO
       ========================================================= */

    private ReviewResponse mapToResponse(
        Review review
    ) {

        User user = review.getUser();

        HostelBasicInfo hostel =
            review.getHostel();

        return ReviewResponse.builder()
            .id(review.getId())

            .hostelId(
                hostel != null
                    ? hostel.getHostelId()
                    : null
            )

            .hostelName(
                hostel != null
                    ? hostel.getHostelName()
                    : null
            )

            .userId(
                user != null
                    ? user.getId()
                    : null
            )

            .userName(
                user != null
                    ? user.getName()
                    : null
            )

            .userRole(
                user != null &&
                user.getRole() != null
                    ? user.getRole().name()
                    : null
            )

            .rating(review.getRating())

            .comment(review.getComment())

            .ownerResponse(
                review.getOwnerResponse()
            )

            .createdAt(review.getCreatedAt())

            .updatedAt(review.getUpdatedAt())

            .build();
    }
}