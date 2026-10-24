package com.example.backend.controller;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.entity.RoomPhoto;
import com.example.backend.entity.User;
import com.example.backend.entity.VerificationStatus;
import com.example.backend.repository.RoomPhotoRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminPhotoService;

import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/admin/photos")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminPhotoController {

    private final AdminPhotoService adminPhotoService;
    private final UserRepository userRepository;

    // =========================================================
    // ADDED FOR ROOM PHOTO VERIFICATION
    // =========================================================
    private final RoomPhotoRepository roomPhotoRepository;

    // =========================================================
    // UPDATE AMENITY PHOTO VERIFICATION
    // =========================================================

    @PutMapping("/amenity/{photoId}/verification")
    public ResponseEntity<?> updateAmenityPhotoVerification(
            @PathVariable Long photoId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        // -----------------------------------------------------
        // GET LOGGED-IN ADMIN
        // -----------------------------------------------------

        String adminEmail = authentication.getName();

        User admin =
                userRepository.findByEmail(adminEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Admin user not found: "
                                                + adminEmail
                                )
                        );

        // -----------------------------------------------------
        // GET REQUEST DATA
        // -----------------------------------------------------

        String status =
                request.get("status");

        String rejectionReason =
                request.get("rejectionReason");

        // -----------------------------------------------------
        // UPDATE PHOTO
        // -----------------------------------------------------

        adminPhotoService.updateAmenityPhotoVerification(
                photoId,
                status,
                rejectionReason,
                admin.getId()
        );

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Amenity photo verification updated successfully."
                )
        );
    }

    @PutMapping("/hostel/{photoId}/verification")
    public ResponseEntity<?> updateHostelPhotoVerification(
            @PathVariable Long photoId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String adminEmail = authentication.getName();

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Admin user not found: " + adminEmail
                        )
                );

        String status = request.get("status");
        String rejectionReason = request.get("rejectionReason");

        adminPhotoService.updateHostelPhotoVerification(
                photoId,
                status,
                rejectionReason,
                admin.getId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Hostel photo verification updated successfully."
                )
        );
    }

    // =========================================================
    // UPDATE ROOM PHOTO VERIFICATION
    // =========================================================
    // FIX:
    // PendingApprovals.jsx calls:
    //
    // PUT /api/admin/photos/room/{photoId}/verification
    //
    // This endpoint was missing, which caused HTTP 404.
    // =========================================================

    @PutMapping("/room/{photoId}/verification")
    public ResponseEntity<?> updateRoomPhotoVerification(
            @PathVariable Long photoId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        // -----------------------------------------------------
        // GET LOGGED-IN ADMIN
        // -----------------------------------------------------

        String adminEmail = authentication.getName();

        User admin =
                userRepository.findByEmail(adminEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Admin user not found: "
                                                + adminEmail
                                )
                        );

        // -----------------------------------------------------
        // GET REQUEST DATA
        // -----------------------------------------------------

        String status =
                request.get("status");

        String rejectionReason =
                request.get("rejectionReason");

        // -----------------------------------------------------
        // VALIDATE STATUS
        // -----------------------------------------------------

        if (status == null || status.isBlank()) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Verification status is required."
                    )
            );
        }

        VerificationStatus verificationStatus;

        try {

            verificationStatus =
                    VerificationStatus.valueOf(
                            status.trim().toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Invalid verification status: " + status
                    )
            );
        }

        // -----------------------------------------------------
        // REJECTION REASON REQUIRED
        // -----------------------------------------------------

        if (verificationStatus == VerificationStatus.REJECTED
                && (rejectionReason == null
                || rejectionReason.isBlank())) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Rejection reason is required."
                    )
            );
        }

        // -----------------------------------------------------
        // FIND ROOM PHOTO
        // -----------------------------------------------------

        RoomPhoto roomPhoto =
                roomPhotoRepository.findById(photoId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Room photo not found with id: "
                                                + photoId
                                )
                        );

        // -----------------------------------------------------
        // UPDATE VERIFICATION STATUS
        // -----------------------------------------------------

        roomPhoto.setVerificationStatus(
                verificationStatus
        );

        // -----------------------------------------------------
        // UPDATE REJECTION REASON
        // -----------------------------------------------------

        if (verificationStatus == VerificationStatus.REJECTED) {

            roomPhoto.setRejectionReason(
                    rejectionReason.trim()
            );

        } else {

            roomPhoto.setRejectionReason(null);
        }

        // -----------------------------------------------------
        // UPDATE REVIEW INFORMATION
        // -----------------------------------------------------

        roomPhoto.setReviewedAt(
                LocalDateTime.now()
        );

        roomPhoto.setReviewedBy(
                admin.getId()
        );

        // -----------------------------------------------------
        // SAVE ROOM PHOTO
        // -----------------------------------------------------

        roomPhotoRepository.save(roomPhoto);

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Room photo verification updated successfully."
                )
        );
    }
}