package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    /*
     * Get all reviews for a particular hostel.
     * Newest reviews appear first.
     */
    List<Review> findByHostelHostelIdOrderByCreatedAtDesc(Long hostelId);

    /*
     * Find the current user's review for a particular hostel.
     */
    Optional<Review> findByHostelHostelIdAndUserId(
        Long hostelId,
        Long userId
    );

    /*
     * Used to prevent a user from submitting
     * more than one review for the same hostel.
     */
    boolean existsByHostelHostelIdAndUserId(
        Long hostelId,
        Long userId
    );

    /*
     * Get all reviews belonging to hostels
     * owned by a particular owner.
     */
    List<Review> findByHostelOwnerIdOrderByCreatedAtDesc(
        Long ownerId
    );
}