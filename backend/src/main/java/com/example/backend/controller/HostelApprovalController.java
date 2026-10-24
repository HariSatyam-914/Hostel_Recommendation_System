package com.example.backend.controller;

import com.example.backend.dto.OwnerHostelStatusResponse;
import com.example.backend.service.HostelApprovalService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class HostelApprovalController {

    private final HostelApprovalService hostelApprovalService;


    // =========================================================
    // SUBMIT HOSTEL FOR APPROVAL
    // =========================================================

    @PostMapping("/{hostelId}/submit-approval")
    public ResponseEntity<?> submitForApproval(
            @PathVariable Long hostelId) {

        hostelApprovalService.submitForApproval(hostelId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Hostel submitted for approval successfully",

                        "hostelId",
                        hostelId,

                        "status",
                        "PENDING"
                )
        );
    }


    // =========================================================
    // GET LOGGED-IN OWNER HOSTEL STATUS
    // =========================================================

    @GetMapping("/status")
        public ResponseEntity<OwnerHostelStatusResponse> getOwnerHostelStatus(
                Authentication authentication) {

        String email = authentication.getName();

        System.out.println("========== OWNER STATUS CHECK ==========");
        System.out.println("Authenticated email: " + email);
        System.out.println("========================================");

        OwnerHostelStatusResponse response =
                hostelApprovalService.getOwnerHostelStatus(email);

        return ResponseEntity.ok(response);
        }

        @PostMapping("/{hostelId}/submit-review")
public ResponseEntity<?> submitReview(
        @PathVariable Long hostelId) {

    hostelApprovalService.submitReview(hostelId);

    return ResponseEntity.ok(
            Map.of(
                    "success", true,
                    "message", "Review submitted successfully",
                    "hostelId", hostelId,
                    "status", "PENDING_ADMIN_REUPLOAD_REVIEW"
            )
    );
}

}