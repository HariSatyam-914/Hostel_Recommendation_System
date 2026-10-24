package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.ResetPasswordRequest;
import com.example.backend.dto.SendOtpRequest;
import com.example.backend.dto.VerifyOtpRequest;
import com.example.backend.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@RequestMapping("/api/password")
@Tag(name = "Password Reset", description = "Forgot Password APIs")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    // Send OTP
    @Operation(summary = "Send OTP to registered email")
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody SendOtpRequest request) {

        passwordResetService.sendOtp(request.getEmail());

        return ResponseEntity.ok("OTP sent successfully.");
    }

    // Verify OTP
    @Operation(summary = "Verify OTP")
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest request) {

        boolean verified = passwordResetService.verifyOtp(
                request.getEmail(),
                request.getOtp());

        if (verified) {
            return ResponseEntity.ok("OTP verified successfully.");
        }

        return ResponseEntity.badRequest().body("Invalid OTP.");
    }

    // Reset Password
    @Operation(summary = "Reset user password")
    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {

        passwordResetService.resetPassword(
                request.getEmail(),
                request.getOtp(),
                request.getNewPassword());

        return ResponseEntity.ok("Password reset successfully.");
    }
}