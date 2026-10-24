package com.example.backend.service;

public interface PasswordResetService {
    void sendOtp(String email);

    boolean verifyOtp(String email, String otp);

    void resetPassword(String email, String otp, String newPassword);
}