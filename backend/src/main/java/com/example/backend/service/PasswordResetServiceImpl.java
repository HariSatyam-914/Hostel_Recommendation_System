package com.example.backend.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.entity.PasswordResetOtp;
import com.example.backend.repository.PasswordResetOtpRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.entity.User;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void sendOtp(String email) {
        System.out.println("Received Email = " + email);
    // Check whether user exists
    userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Generate 6-digit OTP
    String otp = String.valueOf((int) (100000 + Math.random() * 900000));

    // Check if OTP already exists for this email
    PasswordResetOtp passwordResetOtp = otpRepository.findByEmail(email)
            .orElse(new PasswordResetOtp());

    passwordResetOtp.setEmail(email);
    passwordResetOtp.setOtp(otp);
    passwordResetOtp.setVerified(false);
    passwordResetOtp.setCreatedAt(LocalDateTime.now());
    passwordResetOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));

    otpRepository.save(passwordResetOtp);

    // Send email
    emailService.sendEmail(
            email,
            "FindMyHostel Password Reset OTP",
            "Your OTP is: " + otp + "\n\nThis OTP is valid for 5 minutes."
    );
}

@Override
public boolean verifyOtp(String email, String otp) {

    PasswordResetOtp passwordResetOtp = otpRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("OTP not found"));

    if (passwordResetOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
        throw new RuntimeException("OTP Expired");
    }

    if (!passwordResetOtp.getOtp().equals(otp)) {
        throw new RuntimeException("Invalid OTP");
    }

    passwordResetOtp.setVerified(true);
    otpRepository.save(passwordResetOtp);

    return true;
}

    @Override
public void resetPassword(String email, String otp, String newPassword) {

    PasswordResetOtp passwordResetOtp = otpRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("OTP not found"));

    if (!passwordResetOtp.isVerified()) {
        throw new RuntimeException("OTP not verified");
    }

    if (!passwordResetOtp.getOtp().equals(otp)) {
        throw new RuntimeException("Invalid OTP");
    }

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    user.setPassword(passwordEncoder.encode(newPassword));

    userRepository.save(user);

    // Delete OTP after successful password reset
    otpRepository.delete(passwordResetOtp);
}

}