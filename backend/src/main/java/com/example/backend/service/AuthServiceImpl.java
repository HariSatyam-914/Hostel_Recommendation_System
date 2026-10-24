package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;
    private final AuthOtpService authOtpService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNo(request.getPhoneNo());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        Role role = request.isHostelOwner()
                ? Role.OWNER
                : Role.USER;

        user.setRole(role);

        // =====================================================
        // ACCOUNT EMAIL VERIFICATION
        // =====================================================
        // New USER / OWNER must verify email only during
        // registration.
        //
        // This is separate from the existing hostel-owner
        // email verification workflow.
        // =====================================================

        user.setAccountEmailVerified(false);

        User savedUser = userRepository.save(user);

        // =====================================================
        // SEND REGISTRATION OTP
        // =====================================================

        authOtpService.sendRegistrationOtp(
                savedUser.getId()
        );

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createLog(
                savedUser.getName(),
                savedUser.getRole().name(),
                "REGISTRATION_OTP_SENT",
                "Authentication",
                "User",
                String.valueOf(savedUser.getId()),
                null,
                "SUCCESS",
                "Registration OTP sent successfully",
                null
        );

        return new AuthResponse(
                "Registration OTP sent",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                null,
                true
        );
    }


    @Override
    public AuthResponse login(LoginRequest request) {

        // =====================================================
        // NORMAL LOGIN
        // =====================================================
        // Login requires only email + password.
        //
        // NO LOGIN OTP IS SENT HERE.
        // =====================================================

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );


        // =====================================================
        // REGISTRATION EMAIL VERIFICATION CHECK
        // =====================================================
        // This only protects accounts that were created but
        // whose registration OTP has not been verified yet.
        //
        // Once registration OTP is verified,
        // accountEmailVerified = true.
        //
        // Future logins DO NOT require OTP.
        // =====================================================

        if (!user.isAccountEmailVerified()) {

            throw new RuntimeException(
                    "Please verify your email before logging in."
            );
        }


        // =====================================================
        // GENERATE JWT
        // =====================================================

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createLog(
                user.getName(),
                user.getRole().name(),
                "LOGIN_SUCCESS",
                "Authentication",
                "User",
                String.valueOf(user.getId()),
                null,
                "SUCCESS",
                "User login successful",
                null
        );


        // =====================================================
        // DIRECT LOGIN RESPONSE
        // =====================================================

        return new AuthResponse(
                "Login Successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}
