package com.example.backend.controller;

import com.example.backend.dto.ResendAuthOtpRequest;
import com.example.backend.dto.VerifyAuthOtpRequest;
import com.example.backend.service.AuthOtpService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174")
@RequiredArgsConstructor
public class AuthOtpController {

    private final AuthOtpService authOtpService;


    // =========================================================
    // REGISTRATION OTP
    // =========================================================

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<?> verifyRegistrationOtp(
            @RequestBody VerifyAuthOtpRequest request) {

        return ResponseEntity.ok(
                authOtpService.verifyRegistrationOtp(
                        request.getEmail(),
                        request.getOtp()
                )
        );
    }


    @PostMapping("/resend-registration-otp")
    public ResponseEntity<?> resendRegistrationOtp(
            @RequestBody ResendAuthOtpRequest request) {

        authOtpService.resendRegistrationOtp(
                request.getEmail()
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message",
                        "Registration OTP sent"
                )
        );
    }


    // =========================================================
    // LOGIN OTP
    // =========================================================

    @PostMapping("/verify-login-otp")
    public ResponseEntity<?> verifyLoginOtp(
            @RequestBody VerifyAuthOtpRequest request) {

        return ResponseEntity.ok(
                authOtpService.verifyLoginOtp(
                        request.getEmail(),
                        request.getOtp()
                )
        );
    }


    @PostMapping("/resend-login-otp")
    public ResponseEntity<?> resendLoginOtp(
            @RequestBody ResendAuthOtpRequest request) {

        authOtpService.resendLoginOtp(
                request.getEmail()
        );

        return ResponseEntity.ok(
                java.util.Map.of(
                        "message",
                        "Login OTP sent"
                )
        );
    }
}