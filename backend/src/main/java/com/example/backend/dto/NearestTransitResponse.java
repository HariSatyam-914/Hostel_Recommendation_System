package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearestTransitResponse {

    private TransitPlace nearestMetro;

    private TransitPlace nearestBusStop;

    private TransitPlace nearestRailwayStation;

    private TransitPlace nearestAirport;
}