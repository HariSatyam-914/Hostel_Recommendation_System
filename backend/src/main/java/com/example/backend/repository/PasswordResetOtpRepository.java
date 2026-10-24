package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.PasswordResetOtp;


public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> 
{
    Optional<PasswordResetOtp> findByEmail(String email);
}