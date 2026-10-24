package com.example.backend.service;

public interface EmailService {
    void sendOtp(String to, String otp);
    void sendEmail(String to, String subject, String body);
    void sendOwnerVerificationOtp(String to, String otp);
    void sendRegistrationOtp(String to, String otp);
    void sendLoginOtp(String to, String otp);
    void sendHtmlEmail(String to, String subject, String htmlbody);

}