package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthOtpServiceImpl implements AuthOtpService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailpitEmailService mailpitEmailService;

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final Map<String, OtpData> otpStore =
            new ConcurrentHashMap<>();


    // =========================================================
    // REGISTRATION OTP
    // =========================================================

    @Override
    public void sendRegistrationOtp(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String key = createKey(userId, "REGISTRATION");

        checkResendCooldown(key);

        String otp = generateOtp();

        OtpData otpData = new OtpData(
                passwordEncoder.encode(otp),
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES),
                LocalDateTime.now()
        );

        otpStore.put(key, otpData);

        mailpitEmailService.sendRegistrationOtp(
                user.getEmail(),
                otp
        );
    }


    // =========================================================
    // VERIFY REGISTRATION OTP
    // =========================================================

    @Override
    public AuthResponse verifyRegistrationOtp(
            String email,
            String otp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String key = createKey(
                user.getId(),
                "REGISTRATION"
        );

        OtpData otpData = otpStore.get(key);

        if (otpData == null) {

            throw new RuntimeException(
                    "OTP not found. Please request a new OTP."
            );
        }

        if (otpData.expiresAt()
                .isBefore(LocalDateTime.now())) {

            otpStore.remove(key);

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (!passwordEncoder.matches(
                otp,
                otpData.otpHash())) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        // =====================================================
        // ACCOUNT EMAIL VERIFIED
        // =====================================================

        user.setAccountEmailVerified(true);

        User savedUser = userRepository.save(user);

        // Remove OTP after successful verification
        otpStore.remove(key);

        // =====================================================
        // GENERATE JWT
        // =====================================================

        String token = jwtService.generateToken(
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return new AuthResponse(
                "Email verified successfully",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                token
        );
    }


    // =========================================================
    // RESEND REGISTRATION OTP
    // =========================================================

    @Override
    public void resendRegistrationOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        sendRegistrationOtp(user.getId());
    }


    // =========================================================
    // LOGIN OTP
    // =========================================================

    @Override
    public void sendLoginOtp(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String key = createKey(userId, "LOGIN");

        checkResendCooldown(key);

        String otp = generateOtp();

        OtpData otpData = new OtpData(
                passwordEncoder.encode(otp),
                LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES),
                LocalDateTime.now()
        );

        otpStore.put(key, otpData);

        mailpitEmailService.sendLoginOtp(
                user.getEmail(),
                otp
        );
    }


    // =========================================================
    // VERIFY LOGIN OTP
    // =========================================================

    @Override
    public AuthResponse verifyLoginOtp(
            String email,
            String otp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Account email must already be verified
        if (!user.isAccountEmailVerified()) {

            throw new RuntimeException(
                    "Please verify your email first."
            );
        }

        String key = createKey(
                user.getId(),
                "LOGIN"
        );

        OtpData otpData = otpStore.get(key);

        if (otpData == null) {

            throw new RuntimeException(
                    "OTP not found. Please request a new OTP."
            );
        }

        if (otpData.expiresAt()
                .isBefore(LocalDateTime.now())) {

            otpStore.remove(key);

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        if (!passwordEncoder.matches(
                otp,
                otpData.otpHash())) {

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        // Remove OTP after successful verification
        otpStore.remove(key);

        // =====================================================
        // GENERATE JWT
        // =====================================================

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(
                "Login Successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }


    // =========================================================
    // RESEND LOGIN OTP
    // =========================================================

    @Override
    public void resendLoginOtp(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        sendLoginOtp(user.getId());
    }


    // =========================================================
    // GENERATE 6-DIGIT OTP
    // =========================================================

    private String generateOtp() {

        int otp = SECURE_RANDOM.nextInt(1_000_000);

        return String.format(
                "%06d",
                otp
        );
    }


    // =========================================================
    // OTP KEY
    // =========================================================

    private String createKey(
            Long userId,
            String purpose) {

        return userId + ":" + purpose;
    }


    // =========================================================
    // RESEND COOLDOWN
    // =========================================================

    private void checkResendCooldown(String key) {

        OtpData existingOtp =
                otpStore.get(key);

        if (existingOtp == null) {
            return;
        }

        LocalDateTime nextAllowedTime =
                existingOtp.createdAt()
                        .plusSeconds(
                                RESEND_COOLDOWN_SECONDS
                        );

        LocalDateTime now =
                LocalDateTime.now();

        if (now.isBefore(nextAllowedTime)) {

            long remainingSeconds =
                    Duration.between(
                            now,
                            nextAllowedTime
                    ).getSeconds();

            throw new RuntimeException(
                    "Please wait "
                            + remainingSeconds
                            + " seconds before requesting another OTP."
            );
        }
    }


    // =========================================================
    // OTP DATA
    // =========================================================

    private record OtpData(
            String otpHash,
            LocalDateTime expiresAt,
            LocalDateTime createdAt
    ) {
    }
}