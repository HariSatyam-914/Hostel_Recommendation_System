package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.backend.dto.NearestTransitResponse;
import com.example.backend.dto.TransitPlace;
import com.example.backend.entity.OsmTransitPlace;
import com.example.backend.repository.OsmTransitPlaceRepository;

@Service
@RequiredArgsConstructor
public class OsmTransitService {

    private final OsmTransitPlaceRepository repository;

    public NearestTransitResponse findNearestTransit(
            double latitude,
            double longitude) {

        OsmTransitPlace metro =
                repository.findNearest("METRO", latitude, longitude, 20000);

        OsmTransitPlace bus =
                repository.findNearest("BUS", latitude, longitude, 10000);

        OsmTransitPlace railway =
                repository.findNearest("RAILWAY", latitude, longitude, 30000);

        OsmTransitPlace airport =
                repository.findNearest("AIRPORT", latitude, longitude, 100000);

        return NearestTransitResponse.builder()
                .nearestMetro(toDto(metro, latitude, longitude))
                .nearestBusStop(toDto(bus, latitude, longitude))
                .nearestRailwayStation(toDto(railway, latitude, longitude))
                .nearestAirport(toDto(airport, latitude, longitude))
                .build();
    }

    private TransitPlace toDto(
            OsmTransitPlace place,
            double hostelLatitude,
            double hostelLongitude) {

        if (place == null) {
            return null;
        }

        double distanceKm = calculateDistanceKm(
                hostelLatitude,
                hostelLongitude,
                place.getLatitude(),
                place.getLongitude()
        );

        return TransitPlace.builder()
                .name(place.getName())
                .type(place.getTransitType())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .distanceKm(distanceKm)
                .build();
    }

    /**
     * Calculates distance between two coordinates using the Haversine formula.
     */
    private double calculateDistanceKm(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final double EARTH_RADIUS_KM = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2)
                        + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2)
                        * Math.sin(dLon / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return Math.round(EARTH_RADIUS_KM * c * 100.0) / 100.0;
    }
}