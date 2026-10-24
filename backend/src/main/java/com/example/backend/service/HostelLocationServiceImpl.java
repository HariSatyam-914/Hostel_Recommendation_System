package com.example.backend.service;

import com.example.backend.dto.HostelLocationRequest;
import com.example.backend.dto.HostelLocationResponse;
import com.example.backend.entity.HostelBasicInfo;
import com.example.backend.entity.HostelLocation;
import com.example.backend.repository.HostelLocationRepository;
import com.example.backend.repository.HostelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HostelLocationServiceImpl
        implements HostelLocationService {

    private final HostelLocationRepository hostelLocationRepository;

    private final HostelRepository hostelRepository;

    @Override
    @Transactional
    public HostelLocationResponse saveLocation(
            Long hostelId,
            HostelLocationRequest request) {

        // --------------------------------------------
        // 1. Validate Hostel ID
        // --------------------------------------------

        HostelBasicInfo hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hostel not found with ID: " + hostelId
                        )
                );

        // --------------------------------------------
        // 2. Validate Coordinates
        // --------------------------------------------

        if (request.getLatitude() == null) {
            throw new IllegalArgumentException(
                    "Latitude is required."
            );
        }

        if (request.getLongitude() == null) {
            throw new IllegalArgumentException(
                    "Longitude is required."
            );
        }

        if (request.getLatitude() < -90 ||
                request.getLatitude() > 90) {

            throw new IllegalArgumentException(
                    "Invalid latitude."
            );
        }

        if (request.getLongitude() < -180 ||
                request.getLongitude() > 180) {

            throw new IllegalArgumentException(
                    "Invalid longitude."
            );
        }

        // --------------------------------------------
        // 3. Validate Required Address Fields
        // --------------------------------------------

        if (request.getAddress() == null ||
                request.getAddress().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Address is required."
            );
        }

        if (request.getCity() == null ||
                request.getCity().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "City is required."
            );
        }

        if (request.getArea() == null ||
                request.getArea().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Area is required."
            );
        }

        if (request.getState() == null ||
                request.getState().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "State is required."
            );
        }

        if (request.getPincode() == null ||
                request.getPincode().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Pincode is required."
            );
        }

        // --------------------------------------------
        // 4. Check Existing Location
        // --------------------------------------------

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElseGet(HostelLocation::new);

        // --------------------------------------------
        // 5. Set Hostel Relationship
        // --------------------------------------------

        location.setHostel(hostel);

        // --------------------------------------------
        // 6. Save Manual Address Information
        // --------------------------------------------

        location.setAddress(
                request.getAddress().trim()
        );

        location.setLandmark(
                request.getLandmark() != null
                        ? request.getLandmark().trim()
                        : null
        );

        location.setCity(
                request.getCity().trim()
        );

        location.setArea(
                request.getArea().trim()
        );

        location.setState(
                request.getState().trim()
        );

        location.setPincode(
                request.getPincode().trim()
        );

        // --------------------------------------------
        // 7. Save Coordinates
        // --------------------------------------------

        location.setLatitude(
                request.getLatitude()
        );

        location.setLongitude(
                request.getLongitude()
        );

        // --------------------------------------------
        // 8. Save to Database
        // --------------------------------------------

        hostelLocationRepository.save(location);

        // --------------------------------------------
        // 9. Return Response
        // --------------------------------------------

        return new HostelLocationResponse(
                hostelId,
                location.getAddress(),
                location.getLandmark(),
                location.getCity(),
                location.getArea(),
                location.getState(),
                location.getPincode(),
                location.getLatitude(),
                location.getLongitude(),
                "Location saved successfully."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public HostelLocationResponse getLocation(
            Long hostelId) {

        HostelBasicInfo hostel =
                hostelRepository.findById(hostelId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Hostel not found with ID: "
                                                + hostelId
                                )
                        );

        HostelLocation location =
                hostelLocationRepository
                        .findByHostel(hostel)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Location not found for hostel: "
                                                + hostelId
                                )
                        );

        return new HostelLocationResponse(
                hostelId,
                location.getAddress(),
                location.getLandmark(),
                location.getCity(),
                location.getArea(),
                location.getState(),
                location.getPincode(),
                location.getLatitude(),
                location.getLongitude(),
                "Location retrieved successfully."
        );
    }
}