package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.EmailVerificationOtp;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {

    // Get latest unused OTP for verification
    Optional<EmailVerificationOtp>
    findTopByOwnerIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            Long ownerId,
            String purpose
    );

    // Get latest OTP including used OTPs
    // Used for checking resend cooldown
    Optional<EmailVerificationOtp>
    findTopByOwnerIdAndPurposeOrderByCreatedAtDesc(
            Long ownerId,
            String purpose
    );
}