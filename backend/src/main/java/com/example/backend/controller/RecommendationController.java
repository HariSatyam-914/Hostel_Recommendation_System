package com.example.backend.controller;

import com.example.backend.dto.RecommendationRequest;
import com.example.backend.dto.RecommendationResponse;
import com.example.backend.service.RecommendationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Generate personalized hostel recommendations.
     *
     * Example:
     *
     * POST /api/recommendations
     */
    @PostMapping
    public ResponseEntity<RecommendationResponse> recommend(
            @Valid @RequestBody RecommendationRequest request) {

        RecommendationResponse response =
                recommendationService.getRecommendations(request);

        return ResponseEntity.ok(response);
    }
}