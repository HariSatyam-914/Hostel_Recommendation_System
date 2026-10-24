package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private Integer totalResults;

    private Integer requestedLimit;

    @Builder.Default
    private List<RecommendedHostel> recommendations = new ArrayList<>();

    private String message;
}