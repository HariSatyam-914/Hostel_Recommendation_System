package com.example.backend.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /*
     * Do not execute JWT authentication for endpoints that are
     * handled by Spring Security itself or are public endpoints.
     *
     * IMPORTANT:
     *
     * /oauth2/** and /login/** MUST be skipped because Google
     * OAuth2 authentication is handled by Spring Security.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        boolean skip =
                // ==========================================
                // AUTHENTICATION APIs
                // ==========================================
                path.startsWith("/api/auth/")

                // ==========================================
                // PASSWORD APIs
                // ==========================================
                || path.startsWith("/api/password/")

                // ==========================================
                // GOOGLE OAUTH2
                // ==========================================
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/")

                // ==========================================
                // SPRING LOGIN
                // ==========================================
                || path.equals("/login")

                // ==========================================
                // ERROR
                // ==========================================
                || path.equals("/error")

                // ==========================================
                // LOCATION
                // ==========================================
                || path.startsWith("/api/location/")

                // ==========================================
                // TRANSIT
                // ==========================================
                || path.startsWith("/api/transit/")

                // ==========================================
                // SWAGGER
                // ==========================================
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html")
                || path.startsWith("/webjars/")

                // ==========================================
                // UPLOADED FILES
                // ==========================================
                || path.startsWith("/uploads/")

                // ==========================================
                // CHROME DEVTOOLS
                // ==========================================
                || path.startsWith("/.well-known/");

        System.out.println("JWT FILTER PATH: " + path);
        System.out.println("JWT FILTER SKIPPED: " + skip);

        return skip;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("========== JWT FILTER EXECUTED ==========");
        System.out.println("Request URI : " + request.getRequestURI());

        // ==========================================
        // READ AUTHORIZATION HEADER
        // ==========================================

        final String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header : " + authHeader
        );

        // ==========================================
        // NO JWT TOKEN
        // ==========================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("No JWT Token Found");

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // ==========================================
        // REMOVE "Bearer "
        // ==========================================

        String token =
                authHeader.substring(7);

        System.out.println(
                "Token : " + token
        );

        // ==========================================
        // EXTRACT EMAIL
        // ==========================================

        String email =
                jwtService.extractEmail(token);

        System.out.println(
                "Email From Token : " + email
        );

        // ==========================================
        // AUTHENTICATE USER
        // ==========================================

        if (email != null &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(email);

            System.out.println(
                    "User Loaded : "
                            + userDetails.getUsername()
            );

            System.out.println(
                    "Authorities : "
                            + userDetails.getAuthorities()
            );

            // ==========================================
            // VALIDATE JWT
            // ==========================================

            if (jwtService.isTokenValid(
                    token,
                    userDetails.getUsername())) {

                System.out.println(
                        "JWT Token Valid"
                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "Authentication Set Successfully"
                );

            } else {

                System.out.println(
                        "JWT Token Invalid"
                );
            }
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}

