package com.example.backend.service;

import com.example.backend.dto.HostelLocationRequest;
import com.example.backend.dto.HostelLocationResponse;

public interface HostelLocationService {

    HostelLocationResponse saveLocation(
            Long hostelId,
            HostelLocationRequest request
    );

    HostelLocationResponse getLocation(
            Long hostelId
    );
}