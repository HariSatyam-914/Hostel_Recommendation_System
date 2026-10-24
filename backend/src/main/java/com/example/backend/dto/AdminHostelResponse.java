package com.example.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminHostelResponse {

    private Long hostelId;

    private String hostelName;

    private String ownerName;

    private String ownerEmail;

    private String ownerPhone;

    private String city;

    private String locality;

    private String hostelType;

    private String approvalStatus;

    private LocalDateTime submittedAt;
}