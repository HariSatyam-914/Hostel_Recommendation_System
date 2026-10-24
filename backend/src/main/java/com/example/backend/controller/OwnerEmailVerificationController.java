package com.example.backend.controller;

import com.example.backend.service.OwnerEmailVerificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner/hostels")
@RequiredArgsConstructor
public class OwnerEmailVerificationController {

    private final OwnerEmailVerificationService ownerEmailVerificationService;


    // =========================================================
    // GET EMAIL VERIFICATION STATUS
    // =========================================================

    @GetMapping("/{hostelId}/email-verification-status")
    public ResponseEntity<?> getVerificationStatus(
            @PathVariable Long hostelId) {

        return ResponseEntity.ok(
                ownerEmailVerificationService
                        .getVerificationStatusResponse(hostelId)
        );
    }


    // =========================================================
    // SEND OTP
    // =========================================================

    // @PostMapping("/{hostelId}/send-email-otp")
    // public ResponseEntity<?> sendOwnerEmailOtp(
    //         @PathVariable Long hostelId) {

    //     try {

    //         ownerEmailVerificationService.sendOtp(hostelId);

    //         return ResponseEntity.ok(
    //                 Map.of(
    //                         "success", true,
    //                         "message",
    //                         "OTP sent successfully."
    //                 )
    //         );

    //     } catch (RuntimeException e) {

    //         return ResponseEntity.badRequest().body(
    //                 Map.of(
    //                         "success", false,
    //                         "message", e.getMessage()
    //                 )
    //         );
    //     }
    // }


    // =========================================================
    // RESEND OTP
    // =========================================================

    @PostMapping("/{hostelId}/resend-email-otp")
    public ResponseEntity<?> resendOwnerEmailOtp(
            @PathVariable Long hostelId) {

        try {

            ownerEmailVerificationService.resendOtp(hostelId);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "A new OTP has been sent."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }


    // =========================================================
    // VERIFY OTP
    // =========================================================

//    

@PostMapping("/{hostelId}/verify-email-otp")
public ResponseEntity<?> verifyOwnerEmailOtp(
        @PathVariable Long hostelId,
        @RequestBody Map<String, String> request) {
    try {
        String otp = request.get("otp");

        // ============================================================
        // 🔥 Service layer will now check if OTP was requested
        // ============================================================
        boolean verified = ownerEmailVerificationService.verifyOtp(
            hostelId,
            otp
        );

        if (!verified) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "success", false,
                    "message", "Invalid or expired OTP."
                )
            );
        }

        return ResponseEntity.ok(
            Map.of(
                "success", true,
                "message", "Owner email verified successfully.",
                "emailVerificationStatus", "VERIFIED"
            )
        );
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(
            Map.of(
                "success", false,
                "message", e.getMessage()
            )
        );
    }
}
}