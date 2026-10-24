package com.example.backend.service;

import com.example.backend.dto.RecommendationRequest;
import com.example.backend.dto.RecommendationResponse;

public interface RecommendationService {

    RecommendationResponse getRecommendations(
            RecommendationRequest request
    );
}