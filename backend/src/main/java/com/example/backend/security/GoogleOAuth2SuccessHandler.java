package com.example.backend.security;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuditLogService;
import com.example.backend.service.GooglePendingRegistrationService;
import com.example.backend.service.OAuth2LoginCodeService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class GoogleOAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final AuditLogService auditLogService;

    private final OAuth2LoginCodeService oauth2LoginCodeService;

    private final GooglePendingRegistrationService
            googlePendingRegistrationService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauth2User =
                (OAuth2User) authentication.getPrincipal();

        // =====================================================
        // GET GOOGLE USER INFORMATION
        // =====================================================

        String email =
                oauth2User.getAttribute("email");

        String name =
                oauth2User.getAttribute("name");

        Boolean emailVerified =
                oauth2User.getAttribute("email_verified");

        String googleId =
                oauth2User.getAttribute("sub");

        // =====================================================
        // EMAIL CHECK
        // =====================================================

        if (email == null || email.isBlank()) {

            response.sendRedirect(
                    "http://localhost:5174/login?oauth2Error=email_missing"
            );

            return;
        }

        // =====================================================
        // GOOGLE EMAIL VERIFICATION CHECK
        // =====================================================

        if (!Boolean.TRUE.equals(emailVerified)) {

            response.sendRedirect(
                    "http://localhost:5174/login?oauth2Error=email_not_verified"
            );

            return;
        }

        // =====================================================
        // FIND EXISTING USER
        // =====================================================

        System.out.println("========================================");
        System.out.println("GOOGLE OAUTH SUCCESS HANDLER");
        System.out.println("Google Email      : " + email);
        System.out.println("Google Name       : " + name);
        System.out.println("Email Verified    : " + emailVerified);
        System.out.println("Google ID         : " + googleId);
        System.out.println("========================================");

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        System.out.println(
                "USER FOUND IN DATABASE: "
                        + (user != null)
        );

        // =====================================================
        // EXISTING USER
        // =====================================================

        if (user != null) {

            System.out.println(
                    "EXISTING USER BRANCH"
            );

            System.out.println(
                    "User ID   : "
                            + user.getId()
            );

            System.out.println(
                    "User Role : "
                            + user.getRole()
            );

            String token =
                    jwtService.generateToken(
                            user.getEmail(),
                            user.getRole()
                    );

            String loginCode =
                    oauth2LoginCodeService.createCode(
                            new com.example.backend.dto.AuthResponse(
                                    "Google Login Successful",
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getRole(),
                                    token
                            )
                    );

            System.out.println(
                    "OAuth login code created: "
                            + loginCode
            );

            auditLogService.createLog(
                    user.getName(),
                    user.getRole().name(),
                    "GOOGLE_LOGIN_SUCCESS",
                    "Authentication",
                    "User",
                    String.valueOf(user.getId()),
                    null,
                    "SUCCESS",
                    "Existing account authenticated using Google OAuth",
                    null
            );

            String frontendUrl =
                    "http://localhost:5173/oauth2/callback";

            String redirectUrl =
                    frontendUrl
                            + "?code="
                            + URLEncoder.encode(
                                    loginCode,
                                    StandardCharsets.UTF_8
                            );

            System.out.println(
                    "REDIRECTING EXISTING USER TO:"
            );

            System.out.println(
                    redirectUrl
            );

            response.sendRedirect(
                    redirectUrl
            );

            return;
        }

        // =====================================================
        // NEW GOOGLE USER
        // =====================================================

        System.out.println("========================================");
        System.out.println("NEW GOOGLE USER");
        System.out.println("No existing account found.");
        System.out.println("Creating pending registration...");
        System.out.println("========================================");

        /*
         * IMPORTANT:
         *
         * DO NOT create the User entity here.
         *
         * User.phoneNo is NOT NULL in the database.
         *
         * We therefore temporarily store the verified Google
         * identity and ask the user for their phone number.
         */

        String safeName =
                name != null && !name.isBlank()
                        ? name
                        : email.split("@")[0];

        String pendingCode =
                googlePendingRegistrationService
                        .createPendingRegistration(
                                email,
                                safeName,
                                googleId
                        );

        System.out.println(
                "PENDING CODE CREATED: "
                        + pendingCode
        );

        // =====================================================
        // REDIRECT TO PROFILE COMPLETION PAGE
        // =====================================================

        String frontendUrl =
                "http://localhost:5173/oauth2/complete-profile";

        String redirectUrl =
                frontendUrl
                        + "?code="
                        + URLEncoder.encode(
                                pendingCode,
                                StandardCharsets.UTF_8
                        );

        System.out.println(
                "REDIRECTING NEW USER TO:"
        );

        System.out.println(
                redirectUrl
        );

        response.sendRedirect(
                redirectUrl
        );
    }
}