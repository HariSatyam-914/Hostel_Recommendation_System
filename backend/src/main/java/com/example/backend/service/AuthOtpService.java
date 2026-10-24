package com.example.backend.service;

import com.example.backend.dto.AuthResponse;

public interface AuthOtpService {

    void sendRegistrationOtp(Long userId);

    AuthResponse verifyRegistrationOtp(
            String email,
            String otp
    );

    void resendRegistrationOtp(String email);

    void sendLoginOtp(Long userId);

    AuthResponse verifyLoginOtp(
            String email,
            String otp
    );

    void resendLoginOtp(String email);
}