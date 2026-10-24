package com.example.backend.service;

import com.example.backend.dto.AuthResponse;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuth2LoginCodeService {

    private static final long CODE_EXPIRATION_SECONDS = 60;

    private final ConcurrentHashMap<String, LoginCodeEntry> codes =
            new ConcurrentHashMap<>();

    /**
     * Creates a short-lived one-time code.
     */
    public String createCode(AuthResponse authResponse) {

        String code = UUID.randomUUID().toString();

        Instant expiresAt =
                Instant.now()
                        .plusSeconds(CODE_EXPIRATION_SECONDS);

        codes.put(
                code,
                new LoginCodeEntry(
                        authResponse,
                        expiresAt
                )
        );

        return code;
    }

    /**
     * Consumes the code.
     *
     * A code can only be used once.
     */
    public AuthResponse consumeCode(String code) {

        if (code == null || code.isBlank()) {
            throw new RuntimeException(
                    "OAuth login code is missing"
            );
        }

        LoginCodeEntry entry =
                codes.remove(code);

        if (entry == null) {
            throw new RuntimeException(
                    "Invalid or already used OAuth login code"
            );
        }

        if (entry.expiresAt().isBefore(Instant.now())) {
            throw new RuntimeException(
                    "OAuth login code has expired"
            );
        }

        return entry.authResponse();
    }

    /**
     * Automatically removes expired codes.
     *
     * This is intentionally lightweight because your current
     * application is running as a single Spring Boot instance.
     */
    public void removeExpiredCodes() {

        Instant now = Instant.now();

        codes.entrySet().removeIf(
                entry ->
                        entry.getValue()
                                .expiresAt()
                                .isBefore(now)
        );
    }

    private record LoginCodeEntry(
            AuthResponse authResponse,
            Instant expiresAt
    ) {
    }
}