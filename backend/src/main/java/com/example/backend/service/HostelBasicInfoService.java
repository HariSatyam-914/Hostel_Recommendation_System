package com.example.backend.service;

import com.example.backend.dto.HostelBasicInfoRequest;
import com.example.backend.dto.HostelBasicInfoResponse;
import com.example.backend.dto.HostelBasicInfoDetailsResponse;

import org.springframework.security.core.Authentication;

public interface HostelBasicInfoService {

    HostelBasicInfoResponse saveBasicInfo(
            HostelBasicInfoRequest request,
            Authentication authentication
    );

    HostelBasicInfoResponse updateBasicInfo(
            Long hostelId,
            HostelBasicInfoRequest request,
            Authentication authentication
    );

    HostelBasicInfoDetailsResponse getBasicInfo(
            Long hostelId,
            Authentication authentication
    );
}