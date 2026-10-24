package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

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
public class OwnerHostelStatusResponse {

    private boolean hasHostel;

    private String status;

    private Long hostelId;

    private List<Integer> completedSteps;

    private LocalDateTime lastSavedAt;

    private String emailVerificationStatus;
}