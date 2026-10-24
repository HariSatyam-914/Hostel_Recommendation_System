package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtService;
import com.example.backend.service.AuditLogService;
import com.example.backend.service.AuthService;
import com.example.backend.service.GooglePendingRegistrationService;
import com.example.backend.service.OAuth2LoginCodeService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5174")
@Tag(
        name = "Authentication",
        description = "User Registration and Login APIs"
)
public class AuthController {

    private final AuthService authService;

    private final OAuth2LoginCodeService oauth2LoginCodeService;

    private final GooglePendingRegistrationService
            googlePendingRegistrationService;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuditLogService auditLogService;

    public AuthController(
            AuthService authService,
            OAuth2LoginCodeService oauth2LoginCodeService,
            GooglePendingRegistrationService
                    googlePendingRegistrationService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuditLogService auditLogService
    ) {

        this.authService = authService;

        this.oauth2LoginCodeService =
                oauth2LoginCodeService;

        this.googlePendingRegistrationService =
                googlePendingRegistrationService;

        this.userRepository =
                userRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.jwtService =
                jwtService;

        this.auditLogService =
                auditLogService;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    // =========================================================
    // NORMAL PASSWORD LOGIN
    // =========================================================

    @Operation(summary = "Login using email and password")
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    // =========================================================
    // GOOGLE OAUTH2 CODE EXCHANGE
    // =========================================================

    @Operation(
            summary =
                    "Exchange one-time Google OAuth code for JWT"
    )
    @PostMapping("/oauth2/exchange")
    public ResponseEntity<AuthResponse> exchangeGoogleCode(
            @RequestBody Map<String, String> request
    ) {

        String code =
                request.get("code");

        AuthResponse authResponse =
                oauth2LoginCodeService.consumeCode(code);

        return ResponseEntity.ok(
                authResponse
        );
    }

    // =========================================================
    // COMPLETE NEW GOOGLE USER PROFILE
    // =========================================================

    @Operation(
            summary =
                    "Complete profile for a new Google account"
    )
    @PostMapping("/oauth2/complete-profile")
    public ResponseEntity<AuthResponse> completeGoogleProfile(
            @RequestBody Map<String, String> request
    ) {

        String code =
                request.get("code");

        String phoneNo =
                request.get("phoneNo");

        // =====================================================
        // VALIDATE PHONE NUMBER
        // =====================================================

        if (phoneNo == null ||
                phoneNo.isBlank()) {

            throw new RuntimeException(
                    "Phone number is required"
            );
        }

        phoneNo =
                phoneNo.trim();

        if (!phoneNo.matches("\\d{10}")) {

            throw new RuntimeException(
                    "Phone number must contain exactly 10 digits"
            );
        }

        // =====================================================
        // CONSUME TEMPORARY GOOGLE REGISTRATION
        // =====================================================

        GooglePendingRegistrationService.PendingGoogleUser pending =
                googlePendingRegistrationService
                        .consumeCode(code);

        // =====================================================
        // CHECK IF ACCOUNT WAS CREATED DURING THE PROCESS
        // =====================================================

        if (userRepository.existsByEmail(
                pending.email()
        )) {

            throw new RuntimeException(
                    "An account with this email already exists. Please login again with Google."
            );
        }

        // =====================================================
        // CREATE USER
        // =====================================================

        User user =
                new User();

        user.setName(
                pending.name()
        );

        user.setEmail(
                pending.email()
        );

        user.setPhoneNo(
                phoneNo
        );

        /*
         * Google accounts do not use the normal
         * email/password registration password.
         *
         * A random encoded password is stored because
         * the existing User entity requires one.
         */

        user.setPassword(
                passwordEncoder.encode(
                        UUID.randomUUID().toString()
                )
        );

        // =====================================================
        // NEW GOOGLE ACCOUNTS ARE USER
        // =====================================================

        user.setRole(
                Role.USER
        );

        // =====================================================
        // GOOGLE EMAIL ALREADY VERIFIED
        // =====================================================

        user.setAccountEmailVerified(
                true
        );

        User savedUser =
                userRepository.save(user);

        // =====================================================
        // GENERATE JWT
        // =====================================================

        String token =
                jwtService.generateToken(
                        savedUser.getEmail(),
                        savedUser.getRole()
                );

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.createLog(
                savedUser.getName(),
                savedUser.getRole().name(),
                "GOOGLE_ACCOUNT_CREATED",
                "Authentication",
                "User",
                String.valueOf(
                        savedUser.getId()
                ),
                null,
                "SUCCESS",
                "New account created using Google OAuth with completed phone number",
                null
        );

        // =====================================================
        // RESPONSE
        // =====================================================

        return ResponseEntity.ok(
                new AuthResponse(
                        "Google account created successfully",
                        savedUser.getId(),
                        savedUser.getName(),
                        savedUser.getEmail(),
                        savedUser.getRole(),
                        token
                )
        );
    }
}