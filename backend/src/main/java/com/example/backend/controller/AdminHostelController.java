package com.example.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.AdminHostelDetailResponse;
import com.example.backend.dto.AdminHostelResponse;
import com.example.backend.dto.HostelPhotoResponse;
import com.example.backend.dto.OwnerEmailVerificationStatusResponse;
import com.example.backend.service.AdminHostelService;
import com.example.backend.service.OwnerEmailVerificationService;

import lombok.RequiredArgsConstructor;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/admin/hostels")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class AdminHostelController {

    private final AdminHostelService adminHostelService;

    private final OwnerEmailVerificationService ownerEmailVerificationService;


    // =========================================================
    // GET ALL HOSTELS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<AdminHostelResponse>> getAllHostels() {

        return ResponseEntity.ok(
                adminHostelService.getAllHostels()
        );
    }


    // =========================================================
    // GET HOSTEL DETAILS
    // =========================================================

    @GetMapping("/{hostelId}")
    public ResponseEntity<AdminHostelDetailResponse> getHostelDetails(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                adminHostelService.getHostelDetails(hostelId)
        );
    }


    // =========================================================
    // GET HOSTEL PHOTOS
    // =========================================================

    @GetMapping("/{hostelId}/photos")
    public ResponseEntity<List<HostelPhotoResponse>> getHostelPhotos(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                adminHostelService.getHostelPhotos(hostelId)
        );
    }


    // =========================================================
    // GET AMENITY PHOTOS
    // =========================================================

    @GetMapping("/{hostelId}/amenity-photos")
    public ResponseEntity<?> getAmenityPhotos(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                adminHostelService.getAmenityPhotos(hostelId)
        );
    }


    // =========================================================
    // GET ROOM PHOTOS
    // =========================================================

    @GetMapping("/{hostelId}/room-photos")
    public ResponseEntity<?> getRoomPhotos(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                adminHostelService.getRoomPhotos(hostelId)
        );
    }


    // =========================================================
    // GET OWNER EMAIL VERIFICATION STATUS
    // =========================================================
    //
    // This endpoint is required by OwnerVerification.jsx:
    //
    // GET
    // /api/admin/hostels/{hostelId}/owner/email-verification-status
    //
    // It returns the REAL owner email verification status
    // from OwnerEmailVerificationService.
    //
    // Possible values:
    //
    // NOT_REQUESTED
    // OTP_SENT
    // VERIFIED
    //
    // =========================================================

    @GetMapping(
            "/{hostelId}/owner/email-verification-status"
    )
    public ResponseEntity<OwnerEmailVerificationStatusResponse>
    getOwnerEmailVerificationStatus(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                ownerEmailVerificationService
                        .getVerificationStatusResponse(
                                hostelId
                        )
        );
    }


    // =========================================================
    // SEND OWNER EMAIL OTP
    // =========================================================

    @PostMapping(
            "/{hostelId}/owner-email-verification/send-otp"
    )
    public ResponseEntity<?> sendOwnerEmailOtp(
            @PathVariable Long hostelId) {

        adminHostelService.sendOwnerEmailOtp(hostelId);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "OTP sent successfully to the owner's registered email."
                )
        );
    }


    // =========================================================
    // APPROVE HOSTEL
    // =========================================================

    @PutMapping("/{hostelId}/approve")
    public ResponseEntity<?> approveHostel(
            @PathVariable Long hostelId) {

        adminHostelService.approveHostel(hostelId);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Hostel approved successfully",
                        "hostelId",
                        hostelId,
                        "status",
                        "APPROVED"
                )
        );
    }


    // =========================================================
    // REJECT HOSTEL
    // =========================================================

    @PutMapping("/{hostelId}/reject")
    public ResponseEntity<?> rejectHostel(
            @PathVariable Long hostelId) {

        adminHostelService.rejectHostel(hostelId);

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Hostel rejected successfully",
                        "hostelId",
                        hostelId,
                        "status",
                        "REJECTED"
                )
        );
    }


    // =========================================================
    // PHASE 2 - PERMANENTLY DELETE REJECTED HOSTEL
    // =========================================================
    //
    // This endpoint is intentionally separate from rejection.
    //
    // Phase 1:
    // PUT /api/admin/hostels/{hostelId}/reject
    //
    //     -> status becomes REJECTED
    //     -> rejection email is sent
    //     -> hostel data remains
    //
    // Phase 2:
    // DELETE /api/admin/hostels/{hostelId}/permanently-delete
    //
    //     -> only REJECTED hostel can be deleted
    //     -> related hostel data is deleted
    //     -> physical files are cleaned after DB commit
    //     -> owner/user account remains
    //     -> audit logs remain
    //
    // =========================================================

    @DeleteMapping("/{hostelId}/permanently-delete")
    public ResponseEntity<?> permanentlyDeleteRejectedHostel(
            @PathVariable Long hostelId) {

        adminHostelService.permanentlyDeleteRejectedHostel(
                hostelId
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message",
                        "Rejected hostel and all related data were permanently deleted.",
                        "hostelId",
                        hostelId
                )
        );
    }

}