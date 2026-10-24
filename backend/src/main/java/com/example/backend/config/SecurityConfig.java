package com.example.backend.config;

import com.example.backend.security.JwtAuthenticationFilter;
import com.example.backend.security.GoogleOAuth2FailureHandler;
import com.example.backend.security.GoogleOAuth2SuccessHandler;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final AuthenticationProvider authenticationProvider;

    private final GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;
    private final GoogleOAuth2FailureHandler googleOAuth2FailureHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

        // ==========================================
        // CSRF
        // ==========================================

        .csrf(csrf -> csrf.disable())


        // ==========================================
        // CORS
        // ==========================================

        .cors(cors -> {})


        // ==========================================
        // SESSION
        // ==========================================
        //
        // OAuth2 requires a temporary session while
        // communicating with Google.
        //
        // Normal application authentication continues
        // to use JWT.
        //
        // ==========================================

        .sessionManagement(session ->
                session.sessionCreationPolicy(
                        SessionCreationPolicy.IF_REQUIRED
                )
        )


        // ==========================================
        // AUTHORIZATION
        // ==========================================

        .authorizeHttpRequests(auth -> auth

        // ==========================================
        // GOOGLE OAUTH2
        // ==========================================

        .requestMatchers(
                "/oauth2/**",
                "/login/oauth2/**",
                "/login"
        ).permitAll()


        // ==========================================
        // AUTH APIs
        // ==========================================

        .requestMatchers(
                "/api/auth/**"
        ).permitAll()


        // ==========================================
        // PASSWORD APIs
        // ==========================================

        .requestMatchers(
                "/api/password/**"
        ).permitAll()


        // ==========================================
        // LOCATION APIs
        // ==========================================

        .requestMatchers(
                "/api/location/**"
        ).permitAll()


        // ==========================================
        // RECOMMENDATION APIs
        // ==========================================

        .requestMatchers(
                "/api/recommendations/**"
        ).permitAll()


        // ==========================================
        // TRANSIT APIs
        // ==========================================

        .requestMatchers(
                "/api/transit/**"
        ).permitAll()


        // ==========================================
        // PUBLIC HOSTEL DETAILS
        // ==========================================

        .requestMatchers(
                HttpMethod.GET,
                "/api/hostels/*/details"
        ).permitAll()


        // ==========================================
        // PUBLIC UPLOADS
        // ==========================================

        .requestMatchers(
                "/uploads/**"
        ).permitAll()


        // ==========================================
        // REVIEW APIs
        // ==========================================

        .requestMatchers(
                HttpMethod.GET,
                "/api/reviews/hostel/*"
        ).permitAll()

        .requestMatchers(
                HttpMethod.GET,
                "/api/reviews/hostel/*/mine"
        ).authenticated()

        .requestMatchers(
                HttpMethod.POST,
                "/api/reviews"
        ).authenticated()

        .requestMatchers(
                HttpMethod.GET,
                "/api/reviews/owner"
        ).hasRole("OWNER")

        .requestMatchers(
                HttpMethod.PUT,
                "/api/reviews/*/response"
        ).hasRole("OWNER")


        // ==========================================
        // SWAGGER
        // ==========================================

        .requestMatchers(
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**",
                "/webjars/**"
        ).permitAll()


        // ==========================================
        // ERROR
        // ==========================================

        .requestMatchers(
                "/error"
        ).permitAll()


        // ==========================================
        // CHROME DEVTOOLS
        // ==========================================

        .requestMatchers(
                "/.well-known/**"
        ).permitAll()


        // ==========================================
        // EXISTING AMENITY PHOTO GET
        // ==========================================

        .requestMatchers(
                HttpMethod.GET,
                "/api/owner/hostels/amenities/photos/**"
        ).permitAll()


        // ==========================================
        // OWNER APIs
        // ==========================================

        .requestMatchers(
                "/api/owner/**"
        ).hasRole("OWNER")


        // ==========================================
        // ADMIN APIs
        // ==========================================

        .requestMatchers(
                "/api/admin/**"
        ).hasRole("ADMIN")


        // ==========================================
        // EVERYTHING ELSE
        // ==========================================

        .anyRequest()
        .authenticated()
        )


        // ==========================================
        // AUTHENTICATION PROVIDER
        // ==========================================

        .authenticationProvider(
                authenticationProvider
        )


        // ==========================================
        // GOOGLE OAUTH2 LOGIN
        // ==========================================

        .oauth2Login(oauth2 -> oauth2
        .successHandler(
                googleOAuth2SuccessHandler
        )
        .failureHandler(googleOAuth2FailureHandler)
)


        // ==========================================
        // JWT FILTER
        // ==========================================

        .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }
}

