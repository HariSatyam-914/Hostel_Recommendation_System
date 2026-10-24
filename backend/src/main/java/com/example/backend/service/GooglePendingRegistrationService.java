package com.example.backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GooglePendingRegistrationService {

    private static final long CODE_EXPIRATION_SECONDS = 300;

    private final ConcurrentHashMap<
            String,
            PendingGoogleUser
            > pending =
            new ConcurrentHashMap<>();

    public String createPendingRegistration(
            String email,
            String name,
            String googleId
    ) {

        String code =
                UUID.randomUUID().toString();

        Instant expiresAt =
                Instant.now()
                        .plusSeconds(
                                CODE_EXPIRATION_SECONDS
                        );

        pending.put(
                code,
                new PendingGoogleUser(
                        email,
                        name,
                        googleId,
                        expiresAt
                )
        );

        return code;
    }

    public PendingGoogleUser consumeCode(
            String code
    ) {

        if (code == null ||
                code.isBlank()) {

            throw new RuntimeException(
                    "Google profile completion code is missing"
            );
        }

        PendingGoogleUser entry =
                pending.remove(code);

        if (entry == null) {

            throw new RuntimeException(
                    "Invalid or already used Google profile completion code"
            );
        }

        if (entry.expiresAt()
                .isBefore(Instant.now())) {

            throw new RuntimeException(
                    "Google profile completion code has expired"
            );
        }

        return entry;
    }

    public void removeExpiredCodes() {

        Instant now =
                Instant.now();

        pending.entrySet()
                .removeIf(entry ->
                        entry.getValue()
                                .expiresAt()
                                .isBefore(now)
                );
    }

    public record PendingGoogleUser(
            String email,
            String name,
            String googleId,
            Instant expiresAt
    ) {
    }
}