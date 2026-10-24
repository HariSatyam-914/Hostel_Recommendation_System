package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerEmailVerificationStatusResponse {

    private boolean success;

    private String email;

    private String emailVerificationStatus;

    private Long remainingSeconds;
}