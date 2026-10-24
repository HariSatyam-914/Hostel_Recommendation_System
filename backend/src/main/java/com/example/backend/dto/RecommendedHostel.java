package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedHostel {

    private Long hostelId;

    private String hostelName;

    private String hostelType;

    private String address;

    private String city;

    private BigDecimal monthlyRent;

    private String roomType;

    private Double distanceKm;

    private String coverPhotoUrl;

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    /**
     * 0 - 100.
     */
    private Double matchScore;

    private MatchBreakdown matchBreakdown;

    private RoomAvailabilityDto roomAvailability;

    private IssueSummaryDto issueSummary;
}