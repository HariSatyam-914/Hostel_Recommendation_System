package com.example.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {

    private Long id;

    private Long hostelId;

    private String hostelName;

    private Long userId;

    private String userName;

    private String userRole;

    private Integer rating;

    private String comment;

    private String ownerResponse;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}