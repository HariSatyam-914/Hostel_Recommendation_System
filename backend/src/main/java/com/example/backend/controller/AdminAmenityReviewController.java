package com.example.backend.controller;

import com.example.backend.dto.AmenityChangeRequestResponse;
import com.example.backend.service.AmenityChangeRequestService;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminAmenityReviewController {

    private final AmenityChangeRequestService amenityChangeRequestService;
    private final UserRepository userRepository;

    // =========================================================
    // GET PENDING AMENITY / RE-UPLOAD REVIEWS
    // =========================================================
    // Used by ReUploadReview.jsx:
    // GET /api/admin/amenity-change-requests/pending
    //
    // This returns the same pending AmenityChangeRequest data
    // created from the owner's Amenity -> Pending Review section.
    // =========================================================
    @GetMapping("/amenity-change-requests/pending")
    public ResponseEntity<List<AmenityChangeRequestResponse>>
    getPendingAmenityChangeRequests() {

        return ResponseEntity.ok(
                amenityChangeRequestService.getPendingRequests()
        );
    }

    // =========================================================
    // ALSO SUPPORT THE ORIGINAL RE-UPLOAD REVIEW URL
    // =========================================================
    // This keeps the existing frontend compatible if it still calls:
    // GET /api/admin/re-upload-reviews
    // =========================================================
    @GetMapping("/re-upload-reviews")
    public ResponseEntity<List<AmenityChangeRequestResponse>>
    getReUploadReviews() {

        return ResponseEntity.ok(
                amenityChangeRequestService.getPendingRequests()
        );
    }

    // =========================================================
    // APPROVE AMENITY / RE-UPLOAD REQUEST
    // =========================================================
    @PutMapping({
            "/amenity-change-requests/{requestId}/approve",
            "/re-upload-reviews/{requestId}/approve"
    })
    public ResponseEntity<?> approveRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {

        Long adminId = getAdminId(authentication);

        amenityChangeRequestService.approveRequest(
                requestId,
                adminId
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Amenity re-upload approved successfully.",
                        "requestId", requestId,
                        "status", "APPROVED"
                )
        );
    }

    // =========================================================
    // REJECT AMENITY / RE-UPLOAD REQUEST
    // =========================================================
    @PutMapping({
            "/amenity-change-requests/{requestId}/reject",
            "/re-upload-reviews/{requestId}/reject"
    })
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication
    ) {

        String reason = body != null
                ? body.get("reason")
                : null;

        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Rejection reason is required."
                    )
            );
        }

        Long adminId = getAdminId(authentication);

        amenityChangeRequestService.rejectRequest(
                requestId,
                adminId,
                reason.trim()
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Amenity re-upload rejected successfully.",
                        "requestId", requestId,
                        "status", "REJECTED"
                )
        );
    }

    // =========================================================
    // GET LOGGED-IN ADMIN ID
    // =========================================================
    private Long getAdminId(Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()) {

            throw new RuntimeException(
                    "Authenticated admin user is required."
            );
        }

        String adminEmail = authentication.getName();

        User admin = userRepository
                .findByEmail(adminEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Admin user not found: " + adminEmail
                        )
                );

        return admin.getId();
    }
}
