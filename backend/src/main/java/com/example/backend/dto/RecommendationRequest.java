package com.example.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class RecommendationRequest {

    /**
     * Maximum monthly rent the user is willing to pay.
     */
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal maxBudget;

    /**
     * Optional minimum monthly budget.
     */
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal minBudget;

    /**
     * User's preferred office/work location.
     */
    private String officeLocation;

    /**
     * User latitude.
     *
     * Useful when the frontend already has coordinates.
     */
    private Double latitude;

    /**
     * User longitude.
     */
    private Double longitude;

    /**
     * Maximum acceptable distance from office/location.
     *
     * Example: 5 means 5 km.
     */
    @DecimalMin(value = "0.1", inclusive = true)
    private Double maxDistanceKm;

    /**
     * Preferred room sharing.
     *
     * Examples:
     * SINGLE
     * DOUBLE
     * TRIPLE
     */
    private String roomType;

    /**
     * Preferred hostel type.
     *
     * Examples:
     * BOYS
     * GIRLS
     * CO_LIVING
     * UNISEX
     */
    private String hostelType;

    /**
     * Preferred amenities.
     *
     * Examples:
     * WIFI
     * AC
     * LAUNDRY
     * PARKING
     */
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    /**
     * Number of recommendations required.
     */
    @Min(1)
    @Max(50)
    @Builder.Default
    private Integer limit = 10;

    /**
     * Whether only currently available rooms should be considered.
     */
    @Builder.Default
    private Boolean onlyAvailable = true;
}