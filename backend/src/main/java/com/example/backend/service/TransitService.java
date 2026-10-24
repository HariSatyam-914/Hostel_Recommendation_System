package com.example.backend.service;

import com.example.backend.dto.NearestTransitResponse;

public interface TransitService {

    NearestTransitResponse getNearbyTransit(
            double lat,
            double lng
    );
}