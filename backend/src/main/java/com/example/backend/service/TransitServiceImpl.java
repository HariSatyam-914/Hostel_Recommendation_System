package com.example.backend.service;

import com.example.backend.dto.NearestTransitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransitServiceImpl
        implements TransitService {

    private final OsmTransitService osmTransitService;

    @Override
    public NearestTransitResponse getNearbyTransit(
            double latitude,
            double longitude) {

        return osmTransitService.findNearestTransit(
                latitude,
                longitude
        );
    }
}