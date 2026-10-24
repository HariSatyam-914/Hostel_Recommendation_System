package com.example.backend.repository;

import com.example.backend.entity.AuthOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthOtpRepository
        extends JpaRepository<AuthOtp, Long> {

    Optional<AuthOtp>
    findTopByUserIdAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            Long userId,
            String purpose
    );

    Optional<AuthOtp>
    findTopByUserIdAndPurposeOrderByCreatedAtDesc(
            Long userId,
            String purpose
    );
}